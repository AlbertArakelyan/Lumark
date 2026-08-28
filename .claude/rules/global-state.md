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

`AppProvider` runs **four** effects:

1. On mount → `fetchFolders()`, then select `general` if present, else the first folder. **No file fetch here.**
2. When `selectedFolder` changes → `fetchFiles(selectedFolder)`. The only files-fetch path.
3. When `selectedFolder` *or* `selectedFile` changes → `invoke('load_content_by_name')` and `setContent(...)`.
4. When `selectedFolder`, `selectedFile` *or* `content` changes → debounced 500 ms autosave via `invoke('save_content_by_name')`.

### `contentKeyRef`

`content` is one global buffer with no identity, so `contentKeyRef` holds the `folder/file` key it
currently represents. The load effect stamps it (and skips when it already matches); the autosave
effect refuses to write unless it matches the live selection. Without this, switching folder or file
flushes the previous note's buffer into the newly selected path.

When touching `content`, watch for:

- **Autosave races**: any write to `content` re-triggers the autosave timer. Clear `selectedFile` in the same batched update as any folder change — see `resetFolderSelection`, which also resets the ref, `files` and `searchQuery`. `deleteFile` follows the same shape. Never write the ref from inside a state updater.
- **Initial-load races**: the load effect overwrites `content` whenever the selection changes. There is no "content ready" signal beyond the selection being set.
- **No explicit save**: every keystroke schedules a write. Don't introduce a Save button unless you gate autosave behind it.
- **Known limitation**: a pending save younger than 500 ms is discarded on switch, because the cleanup clears the timer.

## Folder scoping

`files` only ever holds the selected folder's notes, so `filteredFiles` is already folder-scoped
search — don't add folder filtering there. `fetchFiles` takes a required `folderName`; `fetchFolders`
returns the loaded list so callers can pick a folder without waiting a render. `general` is an
ordinary folder (renamable, deletable); when zero folders remain, `selectedFolder` is `null` and the
files panel disables its add/search affordances.

## IPC conventions

- `invoke('command_name', { argInCamelCase })` from `@tauri-apps/api/core`. Rust names parameters in `snake_case`; Tauri converts.
- `await invoke(...)` inside `try/catch`; log failures via `console.error`. ESLint sets `no-console: 'warn'` — prefer `error`/`warn` over `log`.
- After IPC that mutates the files list, call `await fetchFiles(folderName)` to refresh — the Rust side does not push updates.

## Don'ts

- Don't add a second context for ad-hoc state — extend this one.
- Don't read files directly from the frontend; everything goes through `invoke`.
- Don't pass `.md`-suffixed names across IPC — see [tauri-commands.md](./tauri-commands.md).
- Don't call a per-file command without a `folderName` — every one of them is folder-scoped.
- Don't replace the debounce without considering existing edit→autosave→reload races.
