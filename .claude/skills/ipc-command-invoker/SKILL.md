---
name: ipc-command-invoker
description: Use when the user wants to **call an existing Tauri command** from a new place in the frontend — adding a button that loads a file, a UI action that triggers an existing IPC, etc. Distinct from creating a new command. Triggers on phrases like "call `load_files` from this component", "wire up the existing IPC", "invoke X from the frontend". For creating NEW commands, use `ipc-command-creator` instead.
---

# IPC command invoker

You're adding a frontend caller for an already-registered Tauri command. No Rust changes needed.

## Step 0: confirm the command exists

Open `src-tauri/src/lib.rs`. Verify:
1. The command is defined as `#[tauri::command]`.
2. It is listed in the `invoke_handler![...]` macro at the bottom.

If either is missing, you're in the wrong skill — switch to `ipc-command-creator`.

Note the exact:
- Command name (snake_case)
- Parameter names (snake_case)
- Return type

## Step 1: write the `invoke` call

Import once at the top of the file:

```ts
import { invoke } from '@tauri-apps/api/core';
```

Call inside an async function with `try/catch`:

```ts
try {
  const result = await invoke<ReturnType>('command_name', { argInCamelCase: value });
  // use result
} catch (error) {
  console.error('Failed to <action>:', error);
}
```

### Required conventions

- **Camel-case the keys**. The Rust param `file_name` is `fileName` on the JS side. Tauri auto-converts.
- **Type the return value** via the `invoke<T>(...)` generic. The Rust return type is `Result<T, String>` — successful resolution gives you `T`, errors throw with the `String` as the message.
- **Wrap in try/catch**. Every Rust command can fail; ESLint warns on `console.log`, so use `console.error`/`console.warn`.

## Step 2: decide where the call lives

- **Affects shared state** (current file, content, files list)? Add the call as a method on `AppProvider` (`src/contexts/AppProvider.tsx`):
  - Add the method body.
  - Extend `IAppContext`.
  - Include it on the `value` object.
  - Consumers call via `useAppContext()`.
  - If it mutates the file list, follow up with `await fetchFiles()`.
- **Purely local** to one component (e.g. opening an external URL, copying a one-off blob)? Inline the `invoke` in the component.

## Step 3: file-identifier reminder

If the command takes a file name, pass the **base name without `.md`**. The Rust side appends the extension. See `load_content_by_name`, `delete_file_by_name`, etc.

## Verification

`yarn lint` — that's enough for a frontend-only change.

## Don'ts

- Don't `import { fs } from '...'` on the frontend. All filesystem work goes through IPC.
- Don't bypass `AppProvider` for state-affecting calls — keep state flow consistent.
- Don't pass `snake_case` keys to `invoke` — Tauri does the conversion for you.
- Don't pass `.md`-suffixed file names.
