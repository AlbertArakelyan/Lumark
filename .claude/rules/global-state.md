# Rule: global state (AppProvider)

**Scope**: `src/contexts/`.
**Mirrored at**: `src/contexts/CLAUDE.md` (authoritative).
**References**: `src/contexts/AppProvider.tsx`.

## State management

`AppProvider` is the **single** provider for the whole app. No Redux, Zustand, Jotai, or similar.

## How to add shared state

1. Add the state slice and any setters/handlers inside `AppProvider`.
2. Extend the `IAppContext` interface.
3. Surface it via the `value` object passed to `<AppContext.Provider>`.
4. Consumers read it via `useAppContext()` — never by importing `AppContext` directly.

If state is local to one component or subtree, keep it there with `useState`/`useReducer`. Only promote to context when multiple unrelated parts of the UI need it.

## Effect ordering

`AppProvider` runs three effects:

1. On mount → `fetchFiles()` populates `files`.
2. When `selectedFile` changes → `invoke('load_content_by_name')` and `setContent(...)`.
3. When `content` *or* `selectedFile` changes → debounced 500 ms autosave via `invoke('save_content_by_name')`.

When touching `content`, watch for:

- **Autosave races**: any write to `content` re-triggers the autosave timer. After deleting the open file, clear `selectedFile` in the same update so autosave doesn't persist the empty buffer back. See `deleteFile` for the pattern.
- **Initial-load races**: the load effect overwrites `content` whenever `selectedFile` changes. There is no "content ready" signal beyond `selectedFile` being set.
- **No explicit save**: every keystroke schedules a write. Don't introduce a Save button unless you gate autosave behind it.

## IPC conventions

- `invoke('command_name', { argInCamelCase })` from `@tauri-apps/api/core`. Rust names parameters in `snake_case`; Tauri converts.
- `await invoke(...)` inside `try/catch`; log failures via `console.error`. ESLint sets `no-console: 'warn'` — prefer `error`/`warn` over `log`.
- After IPC that mutates the files list, call `await fetchFiles()` to refresh — the Rust side does not push updates.

## Don'ts

- Don't add a second context for ad-hoc state — extend this one.
- Don't read files directly from the frontend; everything goes through `invoke`.
- Don't pass `.md`-suffixed names across IPC — see [tauri-commands.md](./tauri-commands.md).
- Don't replace the debounce without considering existing edit→autosave→reload races.
