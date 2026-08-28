# Rust / Tauri backend — rules

This crate is the **only** place in the project that touches the filesystem or any other host capability. The React frontend reaches it exclusively via `invoke('command_name', args)`.

## Where things go

- All `#[tauri::command]` functions live in `src/lib.rs`. Don't split them across new modules without a real reason — the file is still small.
- `main.rs` is just the binary entry — it calls into `lib.rs`.
- New Tauri plugins are added to `Cargo.toml` and initialised inside `run()` (see `tauri_plugin_opener::init()` for the existing pattern).
- Native config (window title/size, bundle targets, identifier) lives in `tauri.conf.json`.

## Command shape (match the existing functions)

Every IPC command must look like the ones already in `lib.rs`:

```rust
#[tauri::command]
fn <snake_case_name>(app: AppHandle, folder_name: String, file_name: String) -> Result<T, String> {
    use std::fs;

    // Read paths use notes_file_path; write paths use notes_file_path_ensured.
    let file_path = notes_file_path(&app, &folder_name, &file_name)?;

    // ... work ...

    Ok(value)
}
```

- Take `app: AppHandle` first when you need the data dir.
- Return `Result<T, String>` and map every `io::Error` to a descriptive `String` via `.map_err(|e| format!(...))`. Don't unwrap.
- Never join paths by hand and never call `app.path().app_data_dir()` directly in a command — go through the path helpers below. Absolute paths and `std::env::current_dir()` are always wrong.
- `use std::fs;` inside the function (matches the existing style — no top-of-file `use`).

## Path helpers (use these, don't reimplement)

Notes live at `app_data_dir/notes/<folder>/<note>.md` — exactly one folder deep.

| Helper | Creates dirs? | Use for |
|---|---|---|
| `notes_dir(&app)` | yes (`notes/`) | listing folders |
| `folder_dir(&app, folder_name)` | no | reading/listing inside a folder |
| `ensure_folder_dir(&app, folder_name)` | yes | creating a folder |
| `notes_file_path(&app, folder_name, file_name)` | no | read, delete, rename |
| `notes_file_path_ensured(&app, folder_name, file_name)` | yes | save, add |

The read/write split is deliberate: read paths must never materialise a folder for a name the user
mistyped, while write paths must never fail — and silently drop the user's buffer — because the
folder vanished underneath the UI.

`validate_name(name, label)` is the **single** guard rejecting separators, `.`/`..` and NUL. Folder
names and file names share it on purpose: a laxer folder check would let `notes/<folder>` escape
while the file path stayed guarded. Don't add a second validator.

`general` is the default folder — the target of both startup migrations, but otherwise ordinary. Only
`.setup()` may guarantee it exists; `load_folders` must not recreate it, or a folder the user deleted
would reappear. `load_folders` hides only dotfiles and `WEBKIT_FILES`; do not filter folders by any
other heuristic, because a hidden folder is an invisible pile of notes.

Migrations share `move_md_files_into`, which **never skips on collision** — it disambiguates through
`unique_md_path`. Skipping strands a note at a path no command can list, which users read as data
loss. Keep that property in any new migration.

## The three-step contract (forgetting any of these is the most common bug)

1. Write the `#[tauri::command]` fn.
2. **Register it** in the `invoke_handler![...]` macro list at the bottom of `lib.rs`. If you skip this, the frontend call fails at runtime with "command not found" — the compiler will *not* catch it.
3. Wire the frontend caller — usually through `src/contexts/AppProvider.tsx` if it touches shared state.

## Naming conventions

- Rust parameter names: `snake_case` (e.g. `file_name`).
- Frontend `invoke` argument keys: `camelCase` (e.g. `fileName`). Tauri auto-converts. Don't pass `file_name` from JS.
- Command names: `snake_case` (e.g. `delete_file_by_name`).

## File naming convention (extension contract)

The frontend identifies a note by its **folder name plus its base name, both without the `.md` extension**. The Rust side appends it, inside the path helpers:

```rust
Ok(dir.join(format!("{}.md", file_name)))
```

`load_files` returns base names via `path.file_stem()` and now also requires `extension() == Some("md")`. Do not break this contract — passing an already-extended name from JS produces `foo.md.md`.

Folder names carry no extension. Since the same base name may exist in several folders, a file name alone is no longer a unique identifier: every per-file command takes `folder_name` too.

## Don'ts

- Don't introduce file I/O in the frontend; it belongs here.
- Don't `.unwrap()` on `io::Result` — map to `String`.
- Don't change the file extension contract without updating every command and every frontend caller in the same change.
- Don't add a per-file command that omits `folder_name`, and don't let a folder name reach the filesystem without `validate_name`.
- Don't support nested folders (`notes/a/b/`) without revisiting every helper and both migrations — the model is deliberately one level deep.
- Don't add async commands unless they actually need to be async — none currently are.
- Don't pull in `serde_yaml`, `tokio`, etc., without a real need; current deps are intentionally minimal.

## Verification

After changes, run `cargo check --manifest-path src-tauri/Cargo.toml` from the repo root. `cargo clippy` is optional but welcome.
