---
description: Bump the app's release version in src-tauri/tauri.conf.json (the canonical version source).
argument-hint: <new-version e.g. 0.5.3 | patch | minor | major>
allowed-tools: Read, Edit, Bash
---

Bump the Lumark release version.

Argument: `$ARGUMENTS`
- If a literal semver like `0.5.3` is given, use it directly.
- If `patch` / `minor` / `major`, read the current `version` from `src-tauri/tauri.conf.json` and increment accordingly.

Steps:
1. Read `src-tauri/tauri.conf.json` and note the current `version`.
2. Compute the new version.
3. Edit **only** `src-tauri/tauri.conf.json` — this is the canonical version source for the app. Do NOT touch `package.json` (it is intentionally pinned at `0.1.0`) or `src-tauri/Cargo.toml`'s version unless the user explicitly asks.
4. Report the old → new version change. Do not commit — leave that to the user.
