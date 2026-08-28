# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Lumark is a local-first cross-platform Markdown note-taking desktop app built with **Tauri 2** (Rust backend) + **React 19 + TypeScript + Vite** (frontend). It uses **Yarn** as the package manager.

## Commands

```bash
yarn tauri dev      # run the full desktop app (Tauri + Vite, port 1420)
yarn dev            # Vite-only dev server (browser preview — most Tauri features won't work)
yarn build          # tsc type-check + vite production build into dist/
yarn tauri build    # produce distributable installers for the current OS
yarn lint           # ESLint flat config (eslint.config.mjs)
yarn lint:fix       # ESLint with --fix
```

No test runner is configured.

The Tauri dev port `1420` is `strictPort: true` — a stale process holding the port will fail the dev server.

## First-time setup: MCP (`.mcp.json`)

`.mcp.json` is **gitignored** so each contributor can add their own API keys without leaking secrets. The committed template is `.mcp.example.json`.

On a fresh clone, copy the template:

```bash
cp .mcp.example.json .mcp.json
```

That's enough to get Context7 working at the free tier — the hosted endpoint (`https://mcp.context7.com/mcp`) requires no auth for basic usage. If you have a Context7 API key, add an `Authorization` header inside `.mcp.json` (not the example — never commit secrets):

```json
{
  "mcpServers": {
    "context7": {
      "type": "http",
      "url": "https://mcp.context7.com/mcp",
      "headers": { "Authorization": "Bearer <YOUR_KEY>" }
    }
  }
}
```

The repo's committed `.claude/settings.json` already pre-approves the `context7` server via `enabledMcpjsonServers`, so Claude Code won't prompt to enable it once `.mcp.json` exists locally.

If `.mcp.json` is missing, the `docs-explorer` skill and the `mcp__context7__*` tools won't be available — the skill flags this and falls back to a personal claude.ai Context7 connection if you have one.

## Architecture

### Two-process model
- **Frontend** (`src/`) — React UI that never touches the filesystem directly.
- **Rust backend** (`src-tauri/src/lib.rs`) — defines all `#[tauri::command]` functions and is the *only* place file I/O happens.
- Communication is exclusively via `invoke('command_name', args)` from `@tauri-apps/api/core`.

When adding any feature that reads/writes user data, you must (1) add a `#[tauri::command]` in `src-tauri/src/lib.rs`, (2) register it in the `invoke_handler!` macro at the bottom of that file, and (3) call it from the frontend via `invoke(...)`.

### File storage model
All notes are flat `.md` files inside a `notes/` subdirectory of Tauri's `app_data_dir()` (resolved per-OS by `app.path().app_data_dir()`). The subdirectory exists so notes don't sit next to WebKit-managed files (`hsts-storage.*`, `cookies.*`) that Tauri writes into `app_data_dir` on Linux. The Rust side resolves it through a `notes_dir(&app)` helper in `src-tauri/src/lib.rs` that creates the dir on demand; commands must use that helper rather than joining straight onto `app_data_dir()`.

Notes live **one folder deep**: `notes/<folder>/<note>.md`. Nesting is exactly one level — there are no folders inside folders. Beyond `notes_dir`, the Rust side resolves paths through these helpers, and commands must use them rather than joining by hand:

- `folder_dir(&app, folder_name)` / `notes_file_path(&app, folder_name, file_name)` — **read** paths; validate but never create.
- `ensure_folder_dir(...)` / `notes_file_path_ensured(...)` — **write** paths; create the folder so an autosave can't fail because the folder vanished under the UI.
- `validate_name(name, label)` — the single shared guard rejecting separators, `.`/`..` and NUL. Folder names and file names deliberately share it so the rules can't drift apart.

`general` is the default folder: both startup migrations land notes there, but it is otherwise an ordinary folder the user can rename or delete. Only `.setup()` guarantees it exists — `load_folders` must not recreate it, or a deleted `general` would come back.

Two startup migrations run in `.setup()`, in this order, each individually non-fatal (`eprintln!` only):
1. `migrate_loose_notes_to_default_folder` — `notes/*.md` → `notes/general/`.
2. `migrate_root_notes_to_default_folder` — `app_data_dir/*.md` → `notes/general/` (skips `hsts-storage.md`).

Loose notes go first because `notes/` is the newer authoritative location, so it wins the plain name. Both share `move_md_files_into`, which **never skips on collision** — it disambiguates via `unique_md_path` (`x.md`, `x (2).md`, …). Skipping would strand a note at a path no command can list, which users read as data loss.

A critical convention: **the frontend identifies a note by its folder name plus its base name, both without the `.md` extension**. The Rust commands append `.md` themselves (see `load_content_by_name`, `save_content_by_name`, `add_file`, `delete_file_by_name`). Do not pass an already-extended name from JS — it will produce `foo.md.md`. `load_files` returns names via `path.file_stem()`, also extension-stripped. Because the same base name may now exist in several folders, anything keyed by file name alone needs the folder too.

### Global state
There is one React context: `src/contexts/AppProvider.tsx`. It owns the *entire* app state:
- `content` / `setContent` — the current editor buffer
- `editorMode` (`SPLIT` | `EDIT` | `PREVIEW` from `editorEnums.ts`)
- `folders` — the folder list loaded from Rust; `selectedFolder` — the open folder's name
- `files` — the file list for the **selected folder only**
- `selectedFile` — the currently open file's base name
- async ops: `fetchFolders`, `selectFolder`, `addFolder`, `renameFolder`, `deleteFolder`, `fetchFiles`, `selectFile`, `addFile`, `deleteFile`, `renameFile`

Consume via `useAppContext()`. There is no Redux/Zustand/etc.

The provider runs **four** effects that wire the data flow:
1. On mount → `fetchFolders()`, then select `general` if present, else the first folder. **No file fetch here.**
2. When `selectedFolder` changes → `fetchFiles(selectedFolder)`. This is the only files-fetch path.
3. When `selectedFolder` or `selectedFile` changes → `invoke('load_content_by_name')` and set `content`.
4. When `selectedFolder`, `selectedFile` or `content` changes → **debounced 500 ms autosave** via `invoke('save_content_by_name')`. There is no explicit save action; every keystroke debounces a write.

Because `content` is one global buffer with no identity, a `contentKeyRef` holding the current
`folder/file` key gates the writes: the load effect stamps it, and the autosave effect refuses to
write unless it matches the live selection. Without that, switching folder or file flushes the
previous note's buffer into the newly selected path. See `src/contexts/CLAUDE.md` for the full
invariant before touching these effects.

Be careful when introducing new effects that touch `content` — they can race with the autosave debounce or with the initial-load effect.

### Editor component
`src/components/Editor/Editor.tsx` runs two parallel views from the same `content` string:
- **Edit pane**: a CodeMirror 6 `EditorView` constructed imperatively against `#editor-container`. The constructor effect has an empty dep array so the editor is created once; an `isEditorContentSetInitially` flag is used to push `content` into CodeMirror only on the initial mount per selected file, and is reset whenever `selectedFile` changes. Updates flow back via the `updateListener` calling `setContent`.
- **Preview pane**: `react-markdown` with `remark-gfm` + `rehype-raw` + `rehype-highlight`, styled by `github-markdown-css` and `highlight.js/styles/github.css`.

The two panes are shown/hidden via Tailwind classes driven by `editorMode`; both remain mounted in `SPLIT` mode.

### Layout
`MainLayout` is a fixed three-column shell: `FoldersPanel` (`w-32`) then `FilesPanel` (`w-64`, i.e. twice the folders panel) on the left, editor children on the right. There is no router. Each `<aside>` keeps `min-h-0` so both panels scroll independently of each other and of the editor.

Search lives in `FilesPanel` and is scoped to the selected folder — `files` only ever holds that folder's notes, so `filteredFiles` needs no folder filtering. Cross-folder ("global") search is a future feature.

The folders panel is genuinely narrow (~112px of usable row width), so folder rows are single-line, icon + truncated name with a `title` tooltip, and hover-revealed rename/delete buttons. Don't add a second line or wide text buttons there.

### UI components (`src/components/UI/`)
This folder is a small in-house UI library. When rendering a generic UI element (button, input, modal, textarea, card, etc.), **first check `src/components/UI/` and reuse what exists**. Don't reach for an external UI library.

If the element you need has a generic UI sense (i.e. it's a reusable presentational primitive, not feature-specific markup) and it doesn't exist yet, **create it in `src/components/UI/` following the existing pattern**. Use feature-local markup directly only when the piece has no reusable UI sense.

Pattern to follow exactly (see `src/components/UI/Button/`, `src/components/UI/Input/` as references):

1. **Folder + file structure**: `src/components/UI/<Name>/<Name>.tsx` + `src/components/UI/<Name>/types.ts`. One folder per component.
2. **Types live in `types.ts`**. Export a props interface named `I<Name>Props` plus any string-literal union types the component exposes (e.g. `ButtonSizeType`, `InputRoundedType`).
3. **Props interface extends the native attributes of the root element** so consumers get the full HTML API for free:
   - `<button>` → `extends ButtonHTMLAttributes<HTMLButtonElement>`
   - `<input>` → `extends InputHTMLAttributes<HTMLInputElement>`
   - `<textarea>` → `extends TextareaHTMLAttributes<HTMLTextAreaElement>`
   - plain `<div>` → `extends HTMLAttributes<HTMLDivElement>`, etc.
4. **If the component accepts children**, the props interface should **also extend `PropsWithChildren`** (see `IButtonProps`). If it does not (e.g. `<input>`), do not.
5. **Component is typed `FC<I<Name>Props>`** and destructures its own named props, leaving `...props` (or `...rest`) to spread onto the root element. `{...props}` goes on the **root element by default**, or on the **most important element when the component wraps its root** — e.g. `Input` spreads onto the actual `<input>` inside a wrapper `<div>`, because the `<input>` is the semantically important element.
6. **Be liberal with `*ClassName` props for flexibility**. Expose a separate className prop for each meaningful structural element rather than only one. Naming follows the structural role: `wrapperClassName`, `labelClassName`, `buttonContainerClassName`, `buttonContentClassName`, `textareaClassName`, etc. The plain destructured `className` is reserved for the root/most-important element so it composes naturally with `{...props}`.
7. **Variant props use string-literal union types** mapped to Tailwind class strings via a `Record<UnionType, string>` inside `useMemo`, with a sensible default fallback (see how `Button` handles `size`, `variant`, `rounded`).
8. Styling is Tailwind utility classes inline in the component — do not introduce CSS modules or styled-components for UI primitives.

### Styling
Tailwind v4 via `@tailwindcss/vite`, but there **is** a v3-style `tailwind.config.js` (CommonJS) at the repo root, loaded explicitly by `@config "../../../tailwind.config.js"` in `src/assets/css/index.css`. That file is where the semantic colour names live. Note it is `.js`, not `.ts`.

Theme tokens therefore take **two edits** — the CSS variable in `src/assets/css/base.css` and the Tailwind colour mapping in `tailwind.config.js`. Miss either and the utility class silently does nothing. Existing tokens: `bg-surface`, `text-text-color`, `border-border-color`, `text-muted-text`, `bg-gray-bg(-hover/-active)`, `bg-primary`/`secondary` (+ shades), `success`/`danger`/`warning`/`info`, and `folder` (the yellow used for folder icons, e.g. `fill-folder text-folder`). A single `colors` entry generates `text-*`, `bg-*` and `fill-*`.

## Folder-scoped rules

Nested `CLAUDE.md` files layer additional rules that apply when working inside those folders:

- `src-tauri/CLAUDE.md` — Rust/Tauri backend: command shape, the three-step IPC contract, file-extension contract, naming conventions.
- `src/contexts/CLAUDE.md` — global state and effect-ordering invariants in `AppProvider`.
- `src/components/Editor/CLAUDE.md` — CodeMirror lifecycle invariants and the React↔CodeMirror sync pattern.
- `src/components/UI/CLAUDE.md` — full pattern for in-house UI primitives.

These are auto-loaded by Claude Code when working in those subtrees — you don't need to import them.

## Project skills (`.claude/skills/`)

Skills auto-trigger when a task matches their description. Available in this repo:

- `committer` — drafts commits in the `<type>(<issue#>): <subject>` format, deriving the issue number from the branch name.
- `ipc-command-creator` — adds a new Tauri `#[tauri::command]` end-to-end (Rust fn + `invoke_handler!` registration + frontend wiring).
- `ipc-command-invoker` — calls an *existing* Tauri command from a new place in the frontend (no Rust changes).
- `ui-component-creator` — scaffolds a new UI primitive under `src/components/UI/` following the Button/Input pattern.
- `docs-explorer` — answers library/framework/API questions by consulting Context7 (`mcp__context7__*` from the project `.mcp.json`) — used for React 19, Tauri 2, CodeMirror 6, Tailwind 4, etc.
- `eslint-fixer` — runs `yarn lint`, applies safe `--fix`, hand-fixes the remainder respecting the empty-dep-array invariants in `AppProvider.tsx` and `Editor.tsx`.
- `issue-starter` — given a GitHub issue number, runs `gh issue view`, creates the branch in `<issue#>-<kebab-summary>` form, and summarises the scope (CONTRIBUTING.md steps 1–3).
- `codemirror-extension-adder` — adds CodeMirror 6 extensions to the editor following the static-vs-reactive (`Compartment`) decision and the lifecycle invariants in `src/components/Editor/CLAUDE.md`.

## Rule catalog (reference only — not auto-loaded)

`.claude/rules/` is a human-browsable catalog. **Claude Code does not auto-load anything from this folder** — only `CLAUDE.md` files auto-load. The catalog exists so a person (or a conversation pointing at `@.claude/rules/<name>.md`) can read the rules in one place. Cross-cutting rules that don't fit any single folder live there:

- `.claude/rules/ipc.md` — frontend ↔ Rust IPC contract end-to-end
- `.claude/rules/commits-and-branches.md` — git workflow, commit-message format
- `.claude/rules/code-style.md` — ESLint highlights, file naming, the versioning quirk, "no test runner"

The folder-scoped rules (UI, Editor, contexts, src-tauri) are also mirrored there, but the **nested `CLAUDE.md` files above are authoritative** — those are what Claude Code actually loads. See `.claude/rules/README.md` for the full index and authority rules.

## Conventions observed in this repo

- **Branches & commits**: branches are created from a GitHub issue ("Create a branch" button), and commit messages follow `<type>(<issue#>): <subject>` — e.g. `feat(47): ...`, `fix(47): ...`, `chore(47): ...`. PRs target `main`.
- **Versioning**: the app version lives in `src-tauri/tauri.conf.json` (not `package.json`, which is still `0.1.0`). Bump it there when shipping a release.
- **ESLint flat config**: 2-space indent, single quotes (JSX double), required semicolons, trailing commas on multiline, arrow `as-needed` body style. Run `yarn lint:fix` before committing.
- **No new test framework**: don't add Jest/Vitest configuration as part of unrelated tasks.
