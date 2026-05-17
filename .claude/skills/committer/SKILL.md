---
name: committer
description: Use when the user asks to commit changes, create a commit, or stage and commit. Drafts a commit message following Lumark's `<type>(<issue#>): <subject>` convention, deriving the issue number from the current branch name (e.g. branch `47-add-delete-buttons-to-files` → `(47)`). Selects `feat` / `fix` / `chore` / `doc` based on what's changed.
---

# Committer

You are committing changes in the Lumark repo. Follow these steps.

## 1. Inspect the working state in parallel

Run in a single message:
- `git status` (no `-uall` flag — it's a large repo)
- `git diff` (staged + unstaged)
- `git log --oneline -10` (to match style)
- `git branch --show-current` (to extract the issue number)

## 2. Derive the issue number

Branch names follow `<issue#>-<kebab-case-summary>` (e.g. `47-add-delete-buttons-to-files`, `51-prepare-a-framework-for-claude-code`). The issue number is the leading integer.

- If the branch matches that pattern → use `(<n>)`.
- If the branch is `main` or doesn't start with a number → use empty parens `()` (the repo has precedent: `doc(): added markdown syntax guide to README`).

## 3. Choose the type

| Type | When |
|------|------|
| `feat` | new feature or feature enhancement |
| `fix` | bug fix |
| `chore` | version bumps, dep updates, plumbing, build config |
| `doc` | documentation-only changes (README, CLAUDE.md, comments) |

For mixed changes, pick the dominant one. Don't invent new types without checking `git log`.

## 4. Write the subject

- 1–2 short phrases describing the change in active voice.
- Focus on **why** more than what when possible (the diff shows what).
- Match the casing of recent commits (the repo log uses lowercase for subject text).
- Keep under ~70 chars if possible.

## 5. Stage and commit

- Stage specific files by name. Avoid `git add -A` / `git add .` unless the user asks — could pick up `.env`, build artifacts, etc.
- Never commit files that look sensitive (`.env`, credentials, keys). Warn the user if they explicitly ask.
- Use a HEREDOC for the message so formatting is preserved:

```bash
git commit -m "$(cat <<'EOF'
<type>(<issue#>): <subject>

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

- Never use `--no-verify`, `--no-gpg-sign`, or `--amend` unless the user explicitly asked. If a hook fails, fix the underlying issue and create a NEW commit.

## 6. Verify

After commit, run `git status` to confirm the commit landed and the tree is in the expected state.

## Don'ts

- Don't push unless asked.
- Don't open a PR unless asked.
- Don't squash unrelated changes into one commit — propose splitting first.
- Don't bump the version (`src-tauri/tauri.conf.json`) as part of an unrelated commit.
