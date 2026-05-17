---
name: ipc-command-creator
description: Use when the user wants to add a new Tauri IPC command — anything reachable via `invoke('name', ...)` from React. Triggers on phrases like "add a Tauri command", "expose X to the frontend", "create a new `#[tauri::command]`", "add IPC for Y". Enforces the three-step contract (Rust fn + invoke_handler! registration + frontend wiring) and the file-extension contract.
---

# IPC command creator

Adds a new Tauri command end-to-end. Read `src-tauri/CLAUDE.md` and `.claude/rules/ipc.md` for the full rules — this skill summarises the workflow.

## Reference existing commands first

Open `src-tauri/src/lib.rs` and skim the existing commands (`save_content_by_name`, `load_content_by_name`, `add_file`, `delete_file_by_name`, `load_files`). Match their shape exactly.

## The three-step contract — all three are required

### Step 1: Add the `#[tauri::command]` to `src-tauri/src/lib.rs`

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

Rules:
- `app: AppHandle` first when you need the data dir.
- Return `Result<T, String>`; map every `io::Error` via `.map_err(|e| format!(...))`. Don't `unwrap`.
- `use std::fs;` inside the function (matches existing style).
- Parameter names in `snake_case`.

### Step 2: Register in `invoke_handler![...]`

At the bottom of `lib.rs`. Easy to forget. If you skip this, the frontend call fails at runtime with "command not found" — the compiler does not catch it.

```rust
.invoke_handler(tauri::generate_handler![
    greet,
    save_content,
    load_content,
    add_file,
    load_files,
    load_content_by_name,
    save_content_by_name,
    delete_file_by_name,
    <your_new_command_here>
])
```

### Step 3: Wire the frontend caller

If the command affects shared state (files list, selected file, content), wire it through `src/contexts/AppProvider.tsx`:

1. Add an async method (e.g. `renameFile`) inside the provider.
2. Inside it: `await invoke('<command_name>', { argInCamelCase })` inside `try/catch`.
3. After writes/deletes, `await fetchFiles()` to refresh — Rust does not push updates.
4. Extend the `IAppContext` interface with the new method.
5. Include it in the `value` object.
6. Consumers call it via `useAppContext()`.

If the call is local to one component, inline `invoke(...)` there instead.

## File-identifier contract

The frontend passes file identifiers as **base names without the `.md` extension**. The Rust side appends:

```rust
let file_path = app_dir.join(file_name + ".md");
```

Passing an already-extended name from JS produces `foo.md.md`. Do not break this.

## Naming bridge

| Side | Convention | Example |
|------|-----------|---------|
| Command name | `snake_case` | `rename_file_by_name` |
| Rust parameter | `snake_case` | `file_name: String` |
| Frontend `invoke` key | `camelCase` | `{ fileName }` |

Tauri auto-converts. Don't pass `snake_case` keys from JS.

## Verification

After changes:
- `cargo check --manifest-path src-tauri/Cargo.toml`
- `yarn lint`

## Delegation

For non-trivial work, consider delegating to the `tauri-command-author` subagent (`.claude/agents/tauri-command-author.md`) which has the same context but works in a separate window.

## Don'ts

- Don't introduce file I/O on the frontend.
- Don't `.unwrap()` on `io::Result` — map to `String`.
- Don't add an async command unless it actually needs to be.
- Don't add new crates without a real need (`tokio`, `serde_yaml`, etc.).
