# Rule: commits & branches

**Scope**: git workflow.
**References**: `CONTRIBUTING.md`, recent `git log`.

## Branch naming

Branches are created from a GitHub issue using the **"Create a branch"** button on the issue page, then checked out locally. The resulting names look like:

```
47-add-delete-buttons-to-files
51-prepare-a-framework-for-claude-code
```

Format: `<issue#>-<kebab-case-summary>`. Issue number first.

PRs always target `main`.

## Commit messages

Format: `<type>(<issue#>): <subject>`.

Observed types in this repo:
- `feat` — new feature or feature enhancement
- `fix` — bug fix
- `chore` — version bumps, dependency updates, plumbing
- `doc` — documentation-only changes
- (Conventional types like `refactor`, `style`, `test`, `perf` are reasonable additions if needed)

Examples:
```
feat(47): added delete functionality for files
fix(47): moved stopPropogation to the top of handleDeleteClick function
chore(47): bumbed version 0.5.2
doc(51): add CLAUDE.md with project architecture and UI conventions
```

The issue number in parentheses comes from the branch name. If a change genuinely has no issue, `doc()` / `chore()` / `feat()` with an empty parens is the observed fallback (see `doc(): added markdown syntax guide to README`).

## What goes in a commit

- One logical change per commit. Subject line should focus on the **why** in 1–2 short phrases.
- Don't squash unrelated changes together.
- Run `yarn lint:fix` before committing — see [code-style.md](./code-style.md).

## Tagging / version bumps

The app version lives in `src-tauri/tauri.conf.json` — see [code-style.md](./code-style.md). A version-bump commit should touch only that file (unless lockfiles are also updated by tooling) and use `chore(<issue#>):` as the type.

## Don'ts

- Don't push directly to `main` — open a PR.
- Don't force-push to `main`.
- Don't `--amend` published commits; create a new commit instead.
- Don't skip hooks (`--no-verify`) without a real reason.
