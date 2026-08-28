# Global state — rules

This folder owns the **entire** app's shared state. There is currently one provider — `AppProvider.tsx` — and that's intentional. No Redux, Zustand, Jotai, or similar.

## How to add shared state

1. Add the state slice and any setters/handlers inside `AppProvider`.
2. Extend the `IAppContext` interface with the new field.
3. Surface it through the `value` object passed to `<AppContext.Provider>`.
4. Consumers read it via `useAppContext()` — never by importing `AppContext` directly.

If a piece of state is local to one component or one subtree, **keep it there with `useState`/`useReducer`** rather than promoting it to the context. Only promote to the context when more than one unrelated part of the UI needs it.

## Effect ordering — handle with care

`AppProvider` runs **four** effects that wire together folder → files → load → autosave:

1. On mount → `fetchFolders()`, then select `general` if present, else the first folder, else `null`. **This effect does not fetch files.**
2. When `selectedFolder` changes → `fetchFiles(selectedFolder)`, or `setFiles([])` when it's `null`.
3. When `selectedFolder` *or* `selectedFile` changes → `invoke('load_content_by_name')` and `setContent(...)`.
4. When `selectedFolder`, `selectedFile` *or* `content` changes → **debounced 500 ms autosave** via `invoke('save_content_by_name')`.

There is exactly **one** files-fetch path (effect 2). Don't add a mount-time `fetchFiles()` back — it
would fire on the first paint with no folder selected and race effect 2.

### The `contentKeyRef` invariant

`content` is a single global buffer with no identity of its own, so the autosave effect cannot tell
whether the buffer still belongs to the note it is about to write. `contentKeyRef` holds the
`folder/file` key (via `buildContentKey`) that `content` currently represents:

- The **load effect stamps** the ref immediately before `setContent`, and skips entirely when the key already matches (a rename re-points the ref, so re-loading would throw away sub-debounce keystrokes).
- The **autosave effect refuses to write** unless `buildContentKey(selectedFolder, selectedFile)` equals `contentKeyRef.current`.

Without this, switching folder or file schedules a write of the *previous* note's buffer into the
*newly selected* path. Never write to `content` without keeping the ref truthful, and never write the
ref from inside a state updater (StrictMode double-invokes those).

When adding effects that read or write `content`, watch out for:

- **Autosave races**: any new write to `content` re-triggers the autosave timer. Clear `selectedFile` in the same batched update as any folder change — see `resetFolderSelection`, which also resets the ref, `files`, and `searchQuery`. `deleteFile` follows the same shape.
- **Initial-load races**: the load effect overwrites `content` whenever the selection changes. Don't start derived effects that depend on `content` being "ready" — there is no ready signal beyond the selection being set.
- **No explicit save action**: every keystroke schedules a write. Don't introduce a "Save" button unless you also gate the autosave behind it.
- **Known limitation**: switching folder or file discards a pending save younger than 500 ms, because the effect cleanup clears the timer. A flush-before-switch is a separate change.

## Folder scoping

`files` only ever holds the selected folder's notes, so `filteredFiles` is already folder-scoped
search — don't add folder filtering to that memo. Cross-folder ("global") search is a future feature
and needs a new backend command, not a change here.

`fetchFiles` takes a **required** `folderName` rather than closing over `selectedFolder`; a zero-arg
version would have to sit in effect 2's dep array, and it is recreated every render. `fetchFolders`
**returns** the loaded list so the bootstrap effect and `deleteFolder` can pick a folder without
waiting a render for state.

`general` is an ordinary folder — renamable and deletable. It is special only as the migration
target, and only `.setup()` on the Rust side guarantees it exists. When zero folders remain,
`selectedFolder` is `null` and the files panel disables its add/search affordances.

## Tauri IPC conventions

- Always go through `invoke('command_name', { argInCamelCase })` from `@tauri-apps/api/core`. The Rust side names parameters in `snake_case`; Tauri converts.
- Always `await invoke(...)` inside a `try/catch` and log via `console.error` on failure (matches the existing style; ESLint has `no-console: 'warn'` so prefer `error`/`warn` over `log`).
- After any IPC that mutates the files list (create, rename, delete), call `await fetchFiles(folderName)` to refresh — the Rust side does not push updates.

## Don'ts

- Don't add a second context for ad-hoc state — extend this one.
- Don't read files directly from the frontend; everything goes through `invoke`.
- Don't pass `.md`-suffixed names across IPC — see `src-tauri/CLAUDE.md`.
- Don't call a per-file command without a `folderName` — every one of them is folder-scoped.
- Don't replace the debounce with a different pattern without considering existing edit-→autosave-→reload races.
