---
name: docs-explorer
description: Use whenever the user asks about a library, framework, SDK, API, CLI tool, or cloud service — even well-known ones (React, Tauri, CodeMirror, Tailwind, Vite, ESLint, lucide-react, react-markdown, remark, rehype, Rust crates, etc.). Includes API syntax, configuration, version migration, library-specific debugging, setup, CLI usage. ALWAYS consults Context7 (`mcp__context7__*`, configured in `.mcp.json`) — never relies on training data for library docs. Skip for: refactoring, writing scripts from scratch, debugging business logic, general programming concepts.
---

# Docs explorer

You are answering a question about an external library, framework, or tool. Your job is to fetch **current** documentation via the Context7 MCP server rather than relying on your training data, which may be out of date.

## When to use this skill

- Library / framework API questions ("how do I use the Tauri AppHandle?", "what's the CodeMirror v6 way to add a keymap?")
- Version migration ("how do I upgrade from Tauri 1 to 2?", "what changed in React 19?")
- Configuration / setup ("Tailwind v4 config", "Vite plugin order")
- Library-specific debugging ("why is my `remark-gfm` plugin not picking up tables?")
- CLI tool usage ("`tauri build` flags", "`cargo clippy` options")

## When NOT to use this skill

- Refactoring or writing scripts from scratch (no specific library API needed)
- Debugging business logic
- Code review
- General programming concepts (algorithms, data structures, language fundamentals)

## Workflow — always two tools

### Step 1: resolve the library

Call `mcp__context7__resolve-library-id` with the library name. This gives you the canonical Context7 ID.

**If `mcp__context7__*` tools aren't available**: the local `.mcp.json` is missing (it's gitignored — see root `CLAUDE.md`). Ask the user to run `cp .mcp.example.json .mcp.json` and restart Claude Code. If you also see `mcp__claude_ai_Context7__*` tools from a personal claude.ai connection, you may use those as a fallback for the current session.

Examples to map first:
- "Tauri" → look up `tauri-apps/tauri` (or v2-specific id)
- "CodeMirror" → look up `codemirror/codemirror` or specific package like `@codemirror/lang-markdown`
- "React" → `facebook/react`
- "Tailwind" → `tailwindlabs/tailwindcss`
- "react-markdown" → `remarkjs/react-markdown`

If the user mentions a specific version (e.g. "Tauri v2", "Tailwind v4", "React 19"), include that in the resolution query — version pinning matters.

### Step 2: query the docs

Call `mcp__context7__query-docs` with the resolved library id and the user's specific question. Provide:
- The library id from step 1.
- A targeted query (not just the library name) — e.g. "AppHandle data_dir method" not just "Tauri".

### Step 3: synthesise an answer

Quote/cite the docs you retrieved. Don't invent API signatures or flags — if the docs don't cover it, say so and suggest where the user can look (GitHub source, issue tracker).

## Don'ts

- **Don't skip Context7** even when you "know" the answer. Your training data has a cutoff and libraries move fast (especially React 19, Tauri 2, Tailwind 4, all of which Lumark uses).
- **Don't use WebSearch as a first resort** for library docs. Context7 is more authoritative and curated.
- **Don't conflate versions.** Lumark uses Tauri v2 — don't return v1 examples. Tailwind v4 — don't return v3 syntax. React 19 — don't return React 17 patterns.
- **Don't answer for libraries that aren't actually used in Lumark** without flagging it. If the user asks about a library not in `package.json` / `Cargo.toml`, point that out.

## Lumark's library inventory (for quick reference)

Frontend (`package.json`):
- React 19, ReactDOM 19
- Tauri 2 (`@tauri-apps/api`, `@tauri-apps/plugin-opener`)
- Vite 7, `@vitejs/plugin-react`
- Tailwind 4 (`@tailwindcss/vite`, `@tailwindcss/typography`)
- CodeMirror 6 (`codemirror`, `@codemirror/lang-markdown`, `@codemirror/highlight`, `@codemirror/state`, `@codemirror/view`)
- CodeMirror themes: `@fsegurai/codemirror-theme-github-light` / `-dark`
- `react-markdown`, `remark-gfm`, `rehype-raw`, `rehype-highlight`
- `github-markdown-css`, `highlight.js`
- `lucide-react` (icons)
- ESLint 9 flat config, TypeScript 5.8

Rust (`src-tauri/Cargo.toml`):
- `tauri = "2"`, `tauri-plugin-opener = "2"`, `serde`, `serde_json`

Match the question to one of these when relevant.
