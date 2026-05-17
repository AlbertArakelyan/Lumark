---
name: codemirror-extension-adder
description: Use when adding a CodeMirror 6 extension to the editor — phrases like "add Tab/Shift+Tab support", "add a keymap", "support Ctrl+B for bold", "add a dark theme toggle", "swap the CodeMirror theme", "add a CodeMirror extension". Several roadmap items (Tab support, key shortcuts, dark mode for the editor) all flow through this skill. Enforces the lifecycle invariants documented in `src/components/Editor/CLAUDE.md`.
---

# CodeMirror extension adder

You're adding a CodeMirror 6 extension to Lumark's editor. The construction is **imperative** (not React-controlled), and the React-side state has subtle race conditions with the autosave, so a few invariants matter.

## Read first

- `src/components/Editor/Editor.tsx` — the existing `EditorView` construction.
- `src/components/Editor/CLAUDE.md` — the lifecycle invariants (read all five).

## Decide: static or reactive?

**Static extension** = configured once, never needs to change for the lifetime of the editor. Examples:
- `EditorView.lineWrapping`
- `markdown()` language support
- `basicSetup`
- A new keymap that's always on

**Reactive extension** = depends on a changing React prop / state. Examples:
- Theme that toggles light ↔ dark
- A keymap that depends on a feature flag
- Read-only mode toggle

Picking wrong is the most common bug.

## Static extension — append to the array

```ts
const startState = EditorState.create({
  doc: content || '',
  extensions: [
    basicSetup,
    EditorView.lineWrapping,
    markdown(),
    githubLight,
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        setContent(update.state.doc.toString());
      }
    }),
    <YOUR NEW EXTENSION HERE>,
  ],
});
```

That's the entire change. Do **not** add the new prop to the construction `useEffect`'s dep array (invariant #1: the editor is constructed once).

### Example: Tab / Shift+Tab support (roadmap item)

```ts
import { keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';

// in extensions:[]
keymap.of([indentWithTab]),
```

### Example: extra keymap entries

```ts
import { keymap } from '@codemirror/view';

keymap.of([
  { key: 'Ctrl-b', run: (view) => { /* wrap selection in ** */ return true; } },
  { key: 'Ctrl-i', run: (view) => { /* wrap selection in * */ return true; } },
]),
```

## Reactive extension — use a `Compartment`

For anything that needs to change after construction (theme toggle, read-only flag), use a `Compartment`. Do not destroy and recreate the `EditorView`.

```ts
import { Compartment } from '@codemirror/state';
import { githubLight } from '@fsegurai/codemirror-theme-github-light';
import { githubDark } from '@fsegurai/codemirror-theme-github-dark';

// hoist outside the component, or store on a ref:
const themeCompartment = useRef(new Compartment()).current;

// in the construction effect:
extensions: [
  // ...
  themeCompartment.of(githubLight), // initial value
]

// in a separate effect that watches the React prop:
useEffect(() => {
  if (!editorRef.current) return;
  editorRef.current.dispatch({
    effects: themeCompartment.reconfigure(isDark ? githubDark : githubLight),
  });
}, [isDark]);
```

Key points:
- The `Compartment` instance must be stable across renders — use `useRef` or define it outside the component.
- The watching effect lives **separate from** the construction effect. Construction stays one-time.
- Use `dispatch({ effects: compartment.reconfigure(...) })`, not `dispatch({ changes: ... })`.

## Adding language support

```ts
import { python } from '@codemirror/lang-python';
```

Then append `python()` to `extensions:[]`. Note: Lumark is a Markdown editor — adding other language support is unusual. Confirm intent with the user.

## What you must NOT do

- **Do not add deps to the construction effect's dep array.** That recreates the `EditorView` on every render, leaks DOM, and resets cursor state.
- **Do not introduce a parallel React-side sync** between `content` and the editor. The single source of truth is `setContent` called from the `updateListener` extension.
- **Do not add a debounce in `Editor.tsx`.** Autosave is already debounced in `AppProvider` (500 ms). Stacking debounces compounds latency.
- **Do not destroy and recreate the editor** when a config prop changes — that's what `Compartment` is for.

## Theme tokens

The current theme is `@fsegurai/codemirror-theme-github-light`. The dark variant `@fsegurai/codemirror-theme-github-dark` is already in `package.json` and imported in a comment for future dark-mode work — wire it via Compartment when dark mode lands.

## Verification

After changes:
1. `yarn lint`
2. Manually test in `yarn tauri dev`: open a file, edit it, switch files, toggle modes (SPLIT/EDIT/PREVIEW). The cursor position should survive mode switches because both panes stay mounted (invariant #2/#5).

If the user can't manually test, **say so explicitly** in the report — don't claim success for an editor change without running it.

## Don'ts (roundup)

- Don't add the new prop to the construction effect's dep array.
- Don't add `useEffect`s that read `content` and write back to it.
- Don't introduce a second autosave debounce.
- Don't swap CodeMirror for `react-simple-code-editor` even though there's an exploratory TODO comment about it.
