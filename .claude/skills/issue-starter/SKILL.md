---
name: issue-starter
description: Use when the user wants to start work on a specific GitHub issue — phrases like "let's work on issue #51", "start issue 47", "tackle #29", "begin work on the dark-mode issue". Fetches the issue with `gh issue view`, creates a branch following Lumark's `<issue#>-<kebab-summary>` convention, and summarises the scope. Mirrors steps 1–3 of CONTRIBUTING.md.
---

# Issue starter

You're starting work on a GitHub issue. Set up the branch and orient the user (or yourself) on what's needed.

## 1. Identify the issue number

From the user's message — `#51`, `issue 51`, `51-`, etc. If ambiguous or missing, ask.

## 2. Fetch the issue

```bash
gh issue view <n>
```

If the user doesn't have `gh` authenticated or the command fails, ask them to authenticate (`gh auth login` — they need to run this themselves with `! gh auth login`) or paste the issue text manually.

Capture from the output:
- **Title** — used to generate the branch name.
- **Body** — used to summarise scope.
- **Labels** — if `good first issue` / `bug` / `enhancement`, mention to the user.
- **State** — if `closed`, stop and surface that to the user before doing anything else.

## 3. Verify the current branch is clean and based on main

In parallel:
```bash
git status
git branch --show-current
```

Then:
- If the tree is dirty, stop and surface the changes. Don't auto-stash unless asked.
- If the current branch isn't `main`, ask before checking out main.
- Optional but recommended: `git fetch origin main` to see if local main is behind. Don't pull without asking.

## 4. Create the branch

Format: `<issue#>-<kebab-case-summary>`. Examples seen in this repo:
- `47-add-delete-buttons-to-files`
- `51-prepare-a-framework-for-claude-code`

Derive the kebab-case summary from the issue title:
- Lowercase
- Replace spaces with `-`
- Strip non-alphanumeric (except `-`)
- Drop filler words sparingly (keep titles recognisable; don't aggressively truncate)
- Aim for 3–6 words

If the GitHub "Create a branch" button has already generated a name on the issue page, prefer that exact string (the user can paste it). Otherwise generate one and show it to the user before creating.

```bash
git checkout -b <issue#>-<kebab-summary>
```

## 5. Summarise the scope

After branch is created, give the user a short orientation:
- One-paragraph summary of what the issue asks for.
- 2–5 bullets listing the files / areas likely to change. Use the project's structure:
  - File operations → `src-tauri/src/lib.rs` + `src/contexts/AppProvider.tsx`
  - Editor changes → `src/components/Editor/Editor.tsx`
  - UI primitives → `src/components/UI/`
  - Sidebar / files list → `src/components/Layouts/MainLayout/FilesPanel/`
- One sentence on what *not* in scope (so scope creep is easier to push back on later).

## 6. Wait for the user's next instruction

Don't start making code changes yet. The user may want to plan, ask questions, or split the work across multiple sessions.

## Don'ts

- Don't auto-pull main. The user may have uncommitted commits to merge first.
- Don't auto-stash dirty changes.
- Don't create a branch off anything other than main without asking.
- Don't push the branch to remote — `committer` will, on first commit, if you set upstream then.
- Don't make code changes in this skill — just set up.
