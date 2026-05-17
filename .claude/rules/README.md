# Rules catalog (reference docs)

Standalone rule documents for Lumark. **Each file is a human-browsable reference doc — nothing in this folder is auto-loaded by Claude Code.**

## What auto-loads vs. what doesn't

Claude Code only has two path-related auto-load mechanisms:

| Location | Auto-loads? | When |
|----------|-------------|------|
| Root `CLAUDE.md` | yes | every Claude Code session in this repo |
| Nested `CLAUDE.md` (e.g. `src/components/UI/CLAUDE.md`) | yes | when Claude Code is working inside that subtree |
| `.claude/rules/*.md` (this folder) | **no** | never automatic — must be opened by hand or pointed at explicitly |
| `.claude/agents/*.md` | invoked on demand | when an agent matching the task is launched |
| `.claude/commands/*.md` | invoked on demand | when a user types `/<name>` |

Claude Code has **no Cursor-style `paths:` / `globs:` frontmatter** for scoping rule files to paths — the nested `CLAUDE.md` mechanism is the only path-scoped option. Don't add `paths:` frontmatter to files here; it would be silently ignored and misleading.

## Why keep this folder then?

- A single browsable place for humans (and for `@.claude/rules/<name>.md` references in conversations) to read the canonical rules.
- Cross-cutting rules (commits, code style, IPC) that don't belong to one folder.

## Index

| Rule | Scope | Authoritative source |
|------|-------|---------------------|
| [ui-components.md](./ui-components.md) | `src/components/UI/` | mirrored — `src/components/UI/CLAUDE.md` auto-loads |
| [tauri-commands.md](./tauri-commands.md) | `src-tauri/` | mirrored — `src-tauri/CLAUDE.md` auto-loads |
| [global-state.md](./global-state.md) | `src/contexts/` | mirrored — `src/contexts/CLAUDE.md` auto-loads |
| [editor.md](./editor.md) | `src/components/Editor/` | mirrored — `src/components/Editor/CLAUDE.md` auto-loads |
| [ipc.md](./ipc.md) | frontend ↔ Rust IPC | this file (cross-cutting, no folder home) |
| [commits-and-branches.md](./commits-and-branches.md) | git workflow | this file |
| [code-style.md](./code-style.md) | repo-wide | this file |

**Authority rule**: when a rule file in this folder and its mirrored nested `CLAUDE.md` disagree, **the `CLAUDE.md` wins** — it's the version Claude Code actually loads. Update both in the same PR to keep them in sync.

## How to make a rule actually take effect

- **Path-scoped rule** for some folder → add or update a nested `CLAUDE.md` inside that folder. Optionally mirror it here for browsability.
- **Repo-wide rule** → add it to the root `CLAUDE.md`. Optionally mirror it here.
- **A reusable workflow Claude should run on demand** → that's an agent (`.claude/agents/<name>.md`) or a slash command (`.claude/commands/<name>.md`), not a rule.
