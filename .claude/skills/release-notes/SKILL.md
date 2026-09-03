---
name: release-notes
description: Use when the user asks for release notes, a changelog entry, or "what's new" text for a Lumark version. Triggers on phrases like "write release notes", "draft the release for 0.8.2", "notes for this release", "changelog entry". Matches the short, plain-spoken bullet style used in the repo's existing GitHub releases, and enforces the no-AI-slop writing rules below.
---

# Release notes

You're writing the human-written part of a Lumark GitHub release. GitHub auto-generates the
"What's Changed" list of merged PRs underneath; your job is only the short bullet summary at the top,
written for someone who uses the app and does not read the code.

## The writing rules (this is the important part)

Write in human readable style, with human familiar punctuation. No AI slop style, no AI slop
punctuation, no AI slop style spaces, and no em dashes.

Concretely, that means:

**Punctuation**

- No em dashes (`—`) and no en dashes (`–`) used as punctuation. If you want to join two thoughts, use
  a comma, a full stop, or rewrite the sentence.
- No spaced hyphens standing in for a dash (` - ` mid-sentence). A hyphen joins words, nothing else.
- No semicolons in a bullet. Split it into two sentences or two bullets.
- No "smart" typography. Plain ASCII apostrophes and quotes only.
- One space after a full stop, never two. No non-breaking spaces, no narrow spaces, no stray space
  before a comma or a full stop.
- Bullets do not need a trailing full stop. Be consistent within one release.

**Words and rhythm**

- Say what changed and why it matters. Nothing else.
- Do not use the "not just X, but Y" construction. Do not use "seamlessly", "effortlessly",
  "robust", "powerful", "elevate", "unlock", "streamline", "leverage", "delve", "boasts",
  "game-changing", "under the hood".
- Do not open a bullet with a participle pile-up ("Introducing...", "Bringing...", "Empowering...").
  Start with the plain verb or the thing itself.
- Do not use the rule-of-three cadence just because it sounds nice. Two items is fine. One is fine.
- No emoji unless the user asks, or unless the release is a breaking one and you're matching the
  existing warning heading.
- No headings for an ordinary patch release. Only add a heading when there's something like
  Breaking Changes to call out.

**Length**

- One to three bullets for a patch release. The repo's v0.8.1 release was literally one bullet.
- A minor or breaking release can go longer, but each bullet still stays on one line where possible.

## The house style, from the actual releases

`v0.8.1`

```
- Made the side panel togglable
```

`v0.8.0` (breaking, so it earned a heading and a note)

```
## Breaking Changes

- Added support for folders, now you can organize your notes among different folders

> If you encounter any issues with file issues please post about here <discussions link>.
```

Note the voice: past tense, plain, describing what the user gets. No marketing.

## Steps

1. Work out what's in the release. Use `git log --oneline <last-tag>..HEAD` and
   `gh release list --limit 3` to see the previous version and how it was written.
2. Read the current version from `src-tauri/tauri.conf.json`. That is the canonical version source,
   not `package.json`.
3. Group the commits by what a user would notice. Internal refactors, lint fixes, token additions and
   version bumps do not get a bullet. A user does not care that a primitive was extracted.
4. Draft the bullets. Apply the writing rules above, then reread the draft looking specifically for em
   dashes, semicolons, and slop words before you show it to the user.
5. Offer a shorter one-bullet variant if the release is small, so the user can pick.
6. Show the notes in the chat as a plain fenced block the user can copy. Do not create the GitHub
   release, do not push a tag, and do not write a CHANGELOG file. There is no CHANGELOG in this repo
   and releases are published by hand.

## Don'ts

- Don't invent features that aren't in the diff.
- Don't restate the PR titles. GitHub already lists them below your section.
- Don't mention file names, function names or component names. This is user-facing text.
- Don't create the release with `gh release create` unless the user explicitly asks.
