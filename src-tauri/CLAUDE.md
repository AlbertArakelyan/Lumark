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
- Return `Result<T, String>` and map every `io::Error` to a descriptive `String` via `.map_err(|e| format!(...))`. Don't unwrap.
- Use `app.path().app_data_dir()` — never an absolute path or `std::env::current_dir()`.
- `use std::fs;` inside the function (matches the existing style — no top-of-file `use`).

## The three-step contract (forgetting any of these is the most common bug)

1. Write the `#[tauri::command]` fn.
2. **Register it** in the `invoke_handler![...]` macro list at the bottom of `lib.rs`. If you skip this, the frontend call fails at runtime with "command not found" — the compiler will *not* catch it.
3. Wire the frontend caller — usually through `src/contexts/AppProvider.tsx` if it touches shared state.

## Naming conventions

- Rust parameter names: `snake_case` (e.g. `file_name`).
- Frontend `invoke` argument keys: `camelCase` (e.g. `fileName`). Tauri auto-converts. Don't pass `file_name` from JS.
- Command names: `snake_case` (e.g. `delete_file_by_name`).

## File naming convention (extension contract)

The frontend identifies files by their **base name without the `.md` extension**. The Rust side appends it:

```rust
let file_path = app_dir.join(file_name + ".md");
```

`load_files` returns base names via `path.file_stem()`. Do not break this contract — passing an already-extended name from JS produces `foo.md.md`.

## Don'ts

- Don't introduce file I/O in the frontend; it belongs here.
- Don't `.unwrap()` on `io::Result` — map to `String`.
- Don't change the file extension contract without updating every command and every frontend caller in the same change.
- Don't add async commands unless they actually need to be async — none currently are.
- Don't pull in `serde_yaml`, `tokio`, etc., without a real need; current deps are intentionally minimal.

## Verification

After changes, run `cargo check --manifest-path src-tauri/Cargo.toml` from the repo root. `cargo clippy` is optional but welcome.
