# Rule: Tauri / Rust backend

**Scope**: `src-tauri/`.
**Mirrored at**: `src-tauri/CLAUDE.md` (authoritative).
**References**: `src-tauri/src/lib.rs` (existing commands), `src-tauri/tauri.conf.json`.

## Where things go

- All `#[tauri::command]` functions live in `src-tauri/src/lib.rs`. Don't split them across new modules without a real reason — the file is still small.
- `main.rs` is the binary entry; it only calls into `lib.rs`.
- New Tauri plugins go in `Cargo.toml` and are initialised inside `run()` (see `tauri_plugin_opener::init()` for the pattern).
- Native config (window, bundle, identifier) lives in `tauri.conf.json`.

## Command shape (match the existing functions)

```rust
#[tauri::command]
fn <snake_case_name>(app: AppHandle, <named_args>) -> Result<T, String> {
    use std::fs;

    let app_dir = app
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {}", e))?;

    // ... work ...

    Ok(value)
}
```

- Take `app: AppHandle` first when you need the data dir.
- Return `Result<T, String>` and map every `io::Error` via `.map_err(|e| format!(...))`. Don't `unwrap`.
- Use `app.path().app_data_dir()` — never absolute paths or `std::env::current_dir()`.
- `use std::fs;` inside the function (matches existing style — no top-of-file `use`).

## The three-step contract

1. Write the `#[tauri::command]` fn.
2. **Register it** in the `invoke_handler![...]` macro list at the bottom of `lib.rs`. Forgetting this fails at runtime with "command not found" — the compiler does not catch it.
3. Wire the frontend caller — usually through `src/contexts/AppProvider.tsx` if it touches shared state.

## Naming

- Rust parameter names: `snake_case` (e.g. `file_name`).
- Frontend `invoke` argument keys: `camelCase` (e.g. `fileName`). Tauri auto-converts.
- Command names: `snake_case` (e.g. `delete_file_by_name`).

## Path helpers

Notes live at `app_data_dir/notes/<folder>/<note>.md` — exactly one folder deep. Never join paths by
hand in a command:

| Helper | Creates dirs? | Use for |
|---|---|---|
| `notes_dir(&app)` | yes (`notes/`) | listing folders |
| `folder_dir(&app, folder_name)` | no | reading/listing inside a folder |
| `ensure_folder_dir(&app, folder_name)` | yes | creating a folder |
| `notes_file_path(&app, folder_name, file_name)` | no | read, delete, rename |
| `notes_file_path_ensured(&app, folder_name, file_name)` | yes | save, add |

Read paths must never materialise a folder for a mistyped name; write paths must never fail (and drop
the user's buffer) because a folder vanished under the UI. `validate_name(name, label)` is the single
shared guard for both folder and file names — don't add a second one.

`general` is the default folder: the target of both startup migrations, otherwise ordinary. Only
`.setup()` may guarantee it exists. Migrations share `move_md_files_into`, which never skips on
collision (it disambiguates via `unique_md_path`) — skipping strands a note where no command can list
it.

## File-extension contract

The frontend identifies a note by its **folder name plus base name, both without the `.md` extension**. The Rust side appends it inside the path helpers:

```rust
Ok(dir.join(format!("{}.md", file_name)))
```

`load_files` returns base names via `path.file_stem()` and requires `extension() == Some("md")`. Passing an already-extended name from JS produces `foo.md.md`. A file name alone is no longer unique — the same base name may exist in several folders.

## Don'ts

- Don't introduce file I/O in the frontend; it belongs here.
- Don't `.unwrap()` on `io::Result` — map to `String`.
- Don't change the extension contract without updating every command and every frontend caller in the same change.
- Don't add a per-file command that omits `folder_name`, and don't let a folder name reach the filesystem without `validate_name`.
- Don't support nested folders (`notes/a/b/`) without revisiting every helper and both migrations.
- Don't make commands async unless they actually need to be.
- Don't add `tokio`, `serde_yaml`, etc., without a real need — deps are intentionally minimal.

## Verification

`cargo check --manifest-path src-tauri/Cargo.toml`. `cargo clippy` optional but welcome.
