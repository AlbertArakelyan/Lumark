---
description: Run the project's quality gates — ESLint (frontend) and cargo check (Rust) — and report failures.
allowed-tools: Bash, Read
---

Run the project's quality gates in parallel and report results:

1. `yarn lint` — ESLint on the frontend.
2. `cargo check --manifest-path src-tauri/Cargo.toml` — Rust compile check (no full build).

Both are read-only / non-mutating. If either fails:
- Summarize each error with file path and line number.
- For ESLint errors that are safely auto-fixable, suggest running `yarn lint:fix` but do not run it automatically.
- For Rust errors, do not attempt fixes unless the user asks — just surface them.

Do not run `yarn build` or `yarn tauri dev` — those are heavier and `tauri dev` is a long-running process the user starts themselves.
