# Rule: code style & repo-wide conventions

**Scope**: repo-wide.
**References**: `eslint.config.mjs`, `package.json`, `src-tauri/tauri.conf.json`.

## Package manager

**Yarn**, not npm. `yarn.lock` is the lockfile of record. Don't commit a `package-lock.json` if one appears.

## ESLint (flat config in `eslint.config.mjs`)

Key style rules — `yarn lint:fix` handles most of these automatically:

- **2-space indent** (`indent: [error, 2, { SwitchCase: 1 }]`).
- **Single quotes** in TS/JS (`quotes: single`); **double quotes** in JSX attrs (`jsx-quotes: prefer-double`).
- **Required semicolons** (`semi: always`).
- **Trailing commas on multiline** (`comma-dangle: always-multiline`).
- **Arrow body style `as-needed`** — no `() => { return x; }` when `() => x` works.
- **Object curly spacing `always`** — `{ foo }` not `{foo}`.
- **Array bracket spacing `never`** — `[1, 2]` not `[ 1, 2 ]`.
- **No trailing whitespace; final newline required.**
- `no-console: warn` — prefer `console.error` / `console.warn` over `console.log`.
- `@typescript-eslint/no-unused-vars: error` with `argsIgnorePattern: '^_'`.
- `@typescript-eslint/no-explicit-any: warn` — avoid `any` where possible.

Run `yarn lint` before committing. `yarn lint:fix` to auto-fix.

## TypeScript

- React 19 + `tsx` files. `react-in-jsx-scope` is off — don't `import React from 'react'` just for JSX.
- Prefer named imports from `react`: `import { FC, useMemo, useState } from 'react'`.
- Type components as `FC<IProps>` when they're simple. The repo doesn't use `React.FC` namespaced — use `FC` from `react`.
- Interfaces over types for component props (`I<Name>Props`).

## File naming

- React components: `PascalCase.tsx`.
- Hooks: `useCamelCase.ts`.
- Types modules: `types.ts` colocated with the component, or `<feature>Types.ts` / `<feature>Enums.ts` under `src/types/<feature>/`.

## No test runner

There is no Jest, Vitest, Playwright, or other test framework configured. Don't add one as part of an unrelated task — propose it as a separate change first.

## No emojis in code

Don't put emojis in source files or commit messages. README and external-facing docs are the only place where emoji is used (and even there, sparingly).

## Versioning quirk

The canonical app version lives in **`src-tauri/tauri.conf.json`** (`"version"` field). `package.json` is intentionally pinned at `0.1.0` and `src-tauri/Cargo.toml` is also pinned at `0.1.0`. When bumping for a release, update `tauri.conf.json` only — leave the other two alone unless the user explicitly asks.

## Comments

Don't add comments that restate what the code does. Only add a comment when the *why* is non-obvious. Don't add JSDoc to ordinary functions.

## Don'ts

- Don't introduce a new state-management library (see [global-state.md](./global-state.md)).
- Don't introduce a new CSS strategy (CSS modules, styled-components) — Tailwind utility classes only.
- Don't introduce a new package manager.
- Don't add `// removed for X` placeholders for deleted code — just delete it.
