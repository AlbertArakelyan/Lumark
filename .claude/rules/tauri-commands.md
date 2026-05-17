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

## File-extension contract

The frontend identifies files by their **base name without the `.md` extension**. The Rust side appends:

```rust
let file_path = app_dir.join(file_name + ".md");
```

`load_files` returns base names via `path.file_stem()`. Passing an already-extended name from JS produces `foo.md.md`.

## Don'ts

- Don't introduce file I/O in the frontend; it belongs here.
- Don't `.unwrap()` on `io::Result` — map to `String`.
- Don't change the extension contract without updating every command and every frontend caller in the same change.
- Don't make commands async unless they actually need to be.
- Don't add `tokio`, `serde_yaml`, etc., without a real need — deps are intentionally minimal.

## Verification

`cargo check --manifest-path src-tauri/Cargo.toml`. `cargo clippy` optional but welcome.
