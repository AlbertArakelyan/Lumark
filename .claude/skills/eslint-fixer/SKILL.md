---
name: eslint-fixer
description: Use when `yarn lint` reports errors or warnings, or when the user asks to fix lint issues, format code, or clean up style. Triggers on phrases like "fix lint errors", "the linter is failing", "run lint:fix", "clean up style". Reads `eslint.config.mjs` to understand which rules apply and respects existing repo conventions.
---

# ESLint fixer

You're cleaning up ESLint errors / warnings in the Lumark repo. The flat config lives at `eslint.config.mjs`.

## Workflow

### Step 1: see what's failing

```bash
yarn lint
```

Parse the output. ESLint errors come in pairs of `file:line:col  error  <message>  <rule-id>`. Group by file.

### Step 2: try the easy path first

For purely stylistic violations (indentation, quotes, semicolons, trailing commas, brace style, spacing), run:

```bash
yarn lint:fix
```

Then re-run `yarn lint` to see what's left.

### Step 3: hand-fix the remainder

These are the rules that `--fix` cannot auto-correct — handle them by hand:

| Rule | Fix |
|------|-----|
| `@typescript-eslint/no-unused-vars` | Delete the unused variable. If it's a function arg that *must* be present (e.g. a callback signature), rename it with a `_` prefix. |
| `@typescript-eslint/no-explicit-any` (warn) | Replace `any` with the real type. If genuinely unknown, use `unknown` and narrow at the use site. |
| `react-hooks/exhaustive-deps` (warn) | Add the missing dep to the dep array — but check the effect's semantics first. If the dep would cause an infinite loop, you may need to refactor (use a ref, useCallback, etc.) rather than just adding the dep. |
| `react-refresh/only-export-components` (warn) | Move non-component exports (constants, helpers) into a separate file. Or use `export const x = { ... } as const` and accept the warning if it's a constant. |
| `no-console` (warn) | Use `console.error` / `console.warn` for error paths. Remove `console.log` debug statements. |
| `react/jsx-key` | Add a stable `key={...}` to each mapped element. Don't use the array index unless the list is provably static. |

### Step 4: verify

Re-run `yarn lint` until it's clean. Don't leave warnings unaddressed unless the user explicitly accepts them — ESLint's `react-hooks/exhaustive-deps` warnings in particular can mask real bugs.

## Key style rules (in case `--fix` is unavailable)

- 2-space indent (`SwitchCase: 1`)
- Single quotes in TS/JS; double quotes in JSX attrs
- Required semicolons
- Trailing commas on multiline
- `arrow-body-style: as-needed` — no `() => { return x; }`
- `object-curly-spacing: always` — `{ foo }` not `{foo}`
- `array-bracket-spacing: never` — `[1, 2]` not `[ 1, 2 ]`
- No trailing whitespace; final newline required

## Special cases

- **`react-hooks/exhaustive-deps` in `AppProvider.tsx`**: this file has effects with intentionally empty dep arrays (e.g. the on-mount `fetchFiles`). If the linter flags one, check `src/contexts/CLAUDE.md` before "fixing" — the empty array may be load-bearing.
- **`react-hooks/exhaustive-deps` in `Editor.tsx`**: the construction effect has an empty dep array on purpose to avoid recreating the CodeMirror `EditorView`. See `src/components/Editor/CLAUDE.md` invariant #1.

## Don'ts

- Don't disable rules with `// eslint-disable-next-line` without a comment explaining why. Prefer a real fix.
- Don't edit `eslint.config.mjs` to silence rules unless the user asks.
- Don't reformat unrelated code while fixing a specific error — keep the diff minimal.
- Don't run `yarn lint:fix` and commit without re-running `yarn lint` afterwards.
