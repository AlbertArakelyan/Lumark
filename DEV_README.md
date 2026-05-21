# Lumark — Developer README

Technical reference for contributors working on the Lumark codebase. End-user installation lives in [README.md](./README.md) and [resources/INSTALLATION.md](./resources/INSTALLATION.md).

## Stack

Lumark is a desktop app built on a **two-process model**:

- **Frontend** — React 19 + TypeScript, bundled by Vite 7. Runs inside the Tauri webview. Never touches the filesystem.
- **Backend** — Rust crate (`src-tauri/`) using Tauri 2. The only place file I/O happens.
- **IPC** — frontend ↔ Rust exclusively via `invoke('command_name', args)` from `@tauri-apps/api/core`.

Current app version: **`0.5.2`** (canonical source: `src-tauri/tauri.conf.json`). `package.json` and `src-tauri/Cargo.toml` are intentionally pinned to `0.1.0`.

## Versions

### Required toolchain

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | `24.13.x` – `24.15.x` | Active LTS line used by the project |
| Yarn | `1.22.x` (Classic) | `yarn.lock` is the lockfile of record — do not commit `package-lock.json` |
| Rust | latest stable (`rustup`) | Edition `2021` |
| Cargo | bundled with Rust | |

Platform prerequisites (WebView2 on Windows, `webkit2gtk` on Linux, Xcode CLT on macOS) are listed in the [Tauri 2 prerequisites guide](https://v2.tauri.app/start/prerequisites/).

### Frontend dependencies (pinned ranges from `package.json`)

| Package | Range |
| --- | --- |
| `react` / `react-dom` | `^19.1.0` |
| `typescript` | `~5.8.3` |
| `vite` | `^7.0.4` |
| `@vitejs/plugin-react` | `^4.6.0` |
| `tailwindcss` / `@tailwindcss/vite` | `^4.1.18` |
| `@tailwindcss/typography` | `^0.5.19` |
| `codemirror` | `^6.0.2` |
| `@codemirror/lang-markdown` | `^6.5.0` |
| `@codemirror/highlight` | `^0.19.8` |
| `@fsegurai/codemirror-theme-github-light` / `-dark` | `^6.2.3` |
| `react-markdown` | `^10.1.0` |
| `remark-gfm` | `^4.0.1` |
| `rehype-raw` | `^7.0.0` |
| `rehype-highlight` | `^7.0.2` |
| `github-markdown-css` | `^5.9.0` |
| `lucide-react` | `^0.577.0` |
| `@tauri-apps/api` / `@tauri-apps/plugin-opener` | `^2` |
| `eslint` / `@eslint/js` | `^9.21.0` |
| `@typescript-eslint/*` | `^8.24.1` |

### Rust dependencies (`src-tauri/Cargo.toml`)

| Crate | Version |
| --- | --- |
| `tauri` | `2` |
| `tauri-build` | `2` |
| `tauri-plugin-opener` | `2` |
| `serde` | `1` (with `derive`) |
| `serde_json` | `1` |

## Installation (development)

```bash
git clone https://github.com/AlbertArakelyan/Lumark.git
cd Lumark

# Install JS dependencies
yarn install

# (Optional) MCP — see "MCP setup" below
cp .mcp.example.json .mcp.json

# Run the desktop app
yarn tauri dev
```

The first `yarn tauri dev` will compile the Rust crate, which is slow. Subsequent runs are incremental.

The Tauri dev server listens on **port 1420** with `strictPort: true` — kill any stale process holding that port before starting.

### MCP setup (optional)

`.mcp.json` is gitignored so each contributor can hold their own API keys. The committed template is `.mcp.example.json`.

```bash
cp .mcp.example.json .mcp.json
```

That is enough for Context7 at the free tier. To use an API key, add an `Authorization` header inside the local `.mcp.json` (never the example) — see `CLAUDE.md` for the exact shape.

## Commands

```bash
yarn tauri dev      # full desktop app (Tauri + Vite, port 1420)
yarn dev            # Vite-only dev server — browser preview, most Tauri features won't work
yarn build          # tsc type-check + Vite production build into dist/
yarn tauri build    # produce distributable installers for the current OS
yarn lint           # ESLint (flat config in eslint.config.mjs)
yarn lint:fix       # ESLint with --fix
```

Rust-side verification:

```bash
cargo check --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml   # optional
```

There is **no test runner configured** (no Jest/Vitest/Playwright). Do not add one as part of an unrelated change.

## Project layout

```
.
├── src/                       React frontend (no filesystem access)
│   ├── assets/css/            Tailwind v4 entry + CSS variables (bg-surface, text-text-color, …)
│   ├── components/
│   │   ├── Editor/            CodeMirror 6 + react-markdown preview, both driven by content
│   │   ├── Layouts/MainLayout Sidebar (FilesPanel) + editor shell
│   │   └── UI/                In-house UI primitives (Button, Input, …)
│   ├── contexts/AppProvider   Single global context: content, files, selectedFile, editorMode
│   └── types/editor           EditorMode enum, etc.
├── src-tauri/                 Rust crate
│   ├── src/lib.rs             All #[tauri::command] functions live here
│   ├── src/main.rs            Binary entry — calls into lib.rs
│   ├── Cargo.toml
│   └── tauri.conf.json        Window, bundle, identifier, canonical app version
├── public/                    Static assets shipped with the frontend
├── resources/                 End-user docs (INSTALLATION.md, …)
├── .claude/                   Claude Code agents, skills, and rules catalog
├── eslint.config.mjs          ESLint flat config
├── vite.config.ts
├── tsconfig.json / tsconfig.node.json
└── package.json
```

## Architecture notes

### File storage

Notes are flat `.md` files inside Tauri's `app_data_dir()` (resolved per-OS by `app.path().app_data_dir()`).

Bundle identifier: `com.albertarakelyan.lumark` (set in `src-tauri/tauri.conf.json`). Tauri resolves `app_data_dir()` to:

| OS | Path |
| --- | --- |
| Linux | `$XDG_DATA_HOME/com.albertarakelyan.lumark/` or `$HOME/.local/share/com.albertarakelyan.lumark/` |
| macOS | `$HOME/Library/Application Support/com.albertarakelyan.lumark/` |
| Windows | `%APPDATA%\com.albertarakelyan.lumark\` (typically `C:\Users\<User>\AppData\Roaming\com.albertarakelyan.lumark\`) |

This is also where you can inspect or back up the user's notes during development.

**Extension contract**: the frontend identifies files by their **base name without the `.md` extension**. The Rust side appends it (`app_dir.join(file_name + ".md")`). Passing an already-extended name from JS produces `foo.md.md`. `load_files` returns names via `path.file_stem()`.

### Global state

Single React context at `src/contexts/AppProvider.tsx` — no Redux/Zustand/etc. It owns `content`, `editorMode`, `files`, `selectedFile`, and async ops `fetchFiles` / `selectFile` / `deleteFile`. Three effects:

1. On mount → `fetchFiles()`.
2. When `selectedFile` changes → `invoke('load_content_by_name')`, then `setContent`.
3. When `content` or `selectedFile` changes → **debounced 500 ms autosave** via `invoke('save_content_by_name')`. There is no explicit save action.

### Editor

`src/components/Editor/Editor.tsx` mounts **CodeMirror 6 imperatively** alongside a **react-markdown** preview, both driven by the same `content` string. The construction effect has an empty dep array intentionally — do not add deps. See [src/components/Editor/CLAUDE.md](./src/components/Editor/CLAUDE.md) for the lifecycle invariants.

### IPC contract (three steps to add a command)

1. Write the `#[tauri::command]` fn in `src-tauri/src/lib.rs` (shape: takes `app: AppHandle` first when it needs the data dir; returns `Result<T, String>`; maps every `io::Error` via `.map_err(|e| format!(...))`).
2. **Register it** in the `invoke_handler![...]` macro at the bottom of `lib.rs`. Forgetting this fails at runtime only — the compiler does not catch it.
3. Wire the frontend caller. If it touches shared state, go through `AppProvider.tsx`; otherwise inline `invoke(...)` in the component. After IPC that mutates the files list, call `await fetchFiles()` — Rust does not push updates.

Naming bridge: command names and Rust params are `snake_case`; frontend `invoke` argument keys are `camelCase`. Tauri converts.

Full IPC reference: [.claude/rules/ipc.md](./.claude/rules/ipc.md).

## Code style

Enforced via ESLint flat config (`eslint.config.mjs`). Highlights:

- 2-space indent; single quotes in TS/JS, double quotes in JSX attributes.
- Required semicolons; trailing commas on multiline.
- Arrow body style `as-needed`; object curly spacing `always`; array bracket spacing `never`.
- `no-console: warn` — prefer `console.error` / `console.warn`.
- `@typescript-eslint/no-unused-vars: error` (with `argsIgnorePattern: '^_'`); `@typescript-eslint/no-explicit-any: warn`.

Run `yarn lint:fix` before committing.

TypeScript: React 19, `react-in-jsx-scope` off. Type components as `FC<I<Name>Props>`. Interfaces over types for component props (`I<Name>Props`).

File naming: React components `PascalCase.tsx`; hooks `useCamelCase.ts`; type modules colocated as `types.ts` or grouped under `src/types/<feature>/`.

## Branches, commits, versioning

- Branches are created from a GitHub issue ("Create a branch" button). Format: `<issue#>-<kebab-summary>` (e.g. `47-add-delete-buttons-to-files`).
- Commit messages: `<type>(<issue#>): <subject>` — observed types: `feat`, `fix`, `chore`, `doc`.
- PRs target `main`. No force-pushes to `main`; no `--amend` on published commits.
- Version bumps touch **only** `src-tauri/tauri.conf.json` (unless tooling updates a lockfile). Use `chore(<issue#>):`.

Full workflow rules: [.claude/rules/commits-and-branches.md](./.claude/rules/commits-and-branches.md) and [CONTRIBUTING.md](./CONTRIBUTING.md).

## Building installers

```bash
yarn tauri build
```

Produces installers under `src-tauri/target/release/bundle/` for the current OS. Bundle targets and icons are configured in `src-tauri/tauri.conf.json`.

## Folder-scoped rules

When working inside these subtrees, additional `CLAUDE.md` rules apply:

- [`src-tauri/CLAUDE.md`](./src-tauri/CLAUDE.md) — Rust/Tauri backend
- [`src/contexts/CLAUDE.md`](./src/contexts/CLAUDE.md) — global state invariants
- [`src/components/Editor/CLAUDE.md`](./src/components/Editor/CLAUDE.md) — CodeMirror lifecycle
- [`src/components/UI/CLAUDE.md`](./src/components/UI/CLAUDE.md) — UI primitive pattern

A browsable mirror of cross-cutting rules lives in [`.claude/rules/`](./.claude/rules/).
