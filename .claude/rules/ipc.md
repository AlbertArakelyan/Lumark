# Rule: IPC (frontend ↔ Rust)

**Scope**: cross-cutting — everywhere `invoke()` is called and every `#[tauri::command]`.
**References**: [tauri-commands.md](./tauri-commands.md), [global-state.md](./global-state.md).

## The contract

- All filesystem I/O lives in `src-tauri/src/lib.rs`. The frontend never touches `fs` directly.
- Frontend calls Rust *exclusively* via `invoke('command_name', args)` from `@tauri-apps/api/core`.
- Rust returns `Result<T, String>`; frontend `await`s the `invoke` inside `try/catch`.

## Naming bridge

| Side | Convention | Example |
|------|------------|---------|
| Command name | `snake_case` | `delete_file_by_name` |
| Rust parameter | `snake_case` | `file_name: String` |
| Frontend `invoke` key | `camelCase` | `{ fileName }` |

Tauri auto-converts between the parameter conventions. Don't pass `snake_case` keys from JS.

## File-identifier contract

Notes live at `notes/<folder>/<note>.md`. The frontend passes a **folder name and a base name, both without the `.md` extension**; Rust appends it inside its path helpers:

```rust
Ok(dir.join(format!("{}.md", file_name)))
```

`load_files` returns `path.file_stem()` strings, also extension-stripped. Breaking this on either side produces `foo.md.md` bugs.

Every per-file command takes `folderName` alongside the file name — the same base name may exist in
several folders, so a file name alone is not a unique identifier. Folder commands are `load_folders`,
`add_folder`, `rename_folder_by_name`, `delete_folder_by_name`.

## Adding a new command (end-to-end)

1. Write the `#[tauri::command]` in `src-tauri/src/lib.rs`.
2. **Register it** in `invoke_handler![...]` at the bottom of `lib.rs` — easiest step to forget, fails at runtime only.
3. Add a frontend caller. If the command affects shared state (files list, selected file, content), wire it through `src/contexts/AppProvider.tsx`:
   - Add a method on the context.
   - Expose it on `IAppContext`.
   - Include it in the `value` object.
   - Call `await fetchFiles()` after writes/deletes that change the file list (Rust does not push updates).
4. If the call is local to one component, inline `invoke(...)` there instead.

## Removing a command

1. Delete the `fn` in `lib.rs`.
2. Remove its entry from `invoke_handler![...]`.
3. Grep the frontend for `invoke('<command_name>'` and remove every caller and any context method wrapping it.

## Error handling

- Rust: map every `io::Error` to a descriptive `String` via `.map_err(|e| format!(...))`. Don't `.unwrap()`.
- Frontend: `try/catch` around every `invoke`; on failure log via `console.error('Failed to <action>:', error)` and recover sensibly (e.g. set empty `content`, clear selection). ESLint warns on `console.log` — prefer `error`/`warn`.

## Verification

`cargo check --manifest-path src-tauri/Cargo.toml` and `yarn lint`.
