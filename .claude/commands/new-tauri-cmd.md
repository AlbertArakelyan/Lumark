---
description: Add a new Tauri IPC command end-to-end (Rust handler + invoke_handler registration + frontend wiring).
argument-hint: <command_name_snake_case> "<brief description>"
allowed-tools: Read, Edit, Write, Glob, Grep, Bash, Agent
---

Add a new Tauri command `$1`.

Arguments: `$ARGUMENTS`
- `$1` = command name in `snake_case` (e.g. `rename_file_by_name`)
- Remaining args = a brief description of what the command should do.

Delegate to the `tauri-command-author` subagent with:
- The command name and described behavior.
- A reminder of the three-step contract: add `#[tauri::command]` to `src-tauri/src/lib.rs`, register it in the `invoke_handler![...]` macro, then wire the frontend caller (typically via `src/contexts/AppProvider.tsx` if it affects shared state).
- A reminder that the frontend passes **extension-less base names** for file commands; Rust appends `.md`.
- Instruction to verify with `cargo check --manifest-path src-tauri/Cargo.toml` and `yarn lint`.

Do not implement the command yourself — delegate.
