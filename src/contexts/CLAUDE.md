# Global state — rules

This folder owns the **entire** app's shared state. There is currently one provider — `AppProvider.tsx` — and that's intentional. No Redux, Zustand, Jotai, or similar.

## How to add shared state

1. Add the state slice and any setters/handlers inside `AppProvider`.
2. Extend the `IAppContext` interface with the new field.
3. Surface it through the `value` object passed to `<AppContext.Provider>`.
4. Consumers read it via `useAppContext()` — never by importing `AppContext` directly.

If a piece of state is local to one component or one subtree, **keep it there with `useState`/`useReducer`** rather than promoting it to the context. Only promote to the context when more than one unrelated part of the UI needs it.

## Effect ordering — handle with care

`AppProvider` runs three effects that wire together selection → load → autosave:

1. On mount → `fetchFiles()` populates `files`.
2. When `selectedFile` changes → `invoke('load_content_by_name')` and `setContent(...)`.
3. When `content` *or* `selectedFile` changes → **debounced 500 ms autosave** via `invoke('save_content_by_name')`.

When adding effects that read or write `content`, watch out for:

- **Autosave races**: any new write to `content` re-triggers the autosave timer. If you `setContent('')` (e.g. after deleting the open file), make sure `selectedFile` is cleared in the same update so autosave doesn't persist the empty buffer back into a still-selected file. See `deleteFile` for the existing pattern.
- **Initial-load races**: the load effect overwrites `content` whenever `selectedFile` changes. Don't start derived effects that depend on `content` being "ready" — there is no ready signal beyond `selectedFile` being set.
- **No explicit save action**: every keystroke schedules a write. Don't introduce a "Save" button unless you also gate the autosave behind it.

## Tauri IPC conventions

- Always go through `invoke('command_name', { argInCamelCase })` from `@tauri-apps/api/core`. The Rust side names parameters in `snake_case`; Tauri converts.
- Always `await invoke(...)` inside a `try/catch` and log via `console.error` on failure (matches the existing style; ESLint has `no-console: 'warn'` so prefer `error`/`warn` over `log`).
- After any IPC that mutates the files list (create, rename, delete), call `await fetchFiles()` to refresh — the Rust side does not push updates.

## Don'ts

- Don't add a second context for ad-hoc state — extend this one.
- Don't read files directly from the frontend; everything goes through `invoke`.
- Don't pass `.md`-suffixed names across IPC — see `src-tauri/CLAUDE.md`.
- Don't replace the debounce with a different pattern without considering existing edit-→autosave-→reload races.
