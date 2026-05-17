# Rule: Editor (CodeMirror + Preview)

**Scope**: `src/components/Editor/`.
**Mirrored at**: `src/components/Editor/CLAUDE.md` (authoritative).
**References**: `src/components/Editor/Editor.tsx`, `src/components/Editor/EditorMode.tsx`, `src/types/editor/editorEnums.ts`.

The editor mounts **CodeMirror 6 imperatively** alongside a **react-markdown** preview, both driven by the same `content` string from `AppContext`.

## Invariants you must preserve

1. **CodeMirror is constructed once.** The construction effect in `Editor.tsx` has an empty dep array intentionally. Do not add deps — recreating the `EditorView` on every render leaks DOM and destroys cursor state.
2. **The `#editor-container` DOM node is the mount point** — a single `<div>` that CodeMirror appends into. Don't conditionally unmount the wrapper based on `editorMode`; visibility is controlled via Tailwind `hidden` so the instance survives mode switches.
3. **`isEditorContentSetInitially` gates the initial doc push** from React `content` → CodeMirror. It's reset to `false` when `selectedFile` changes so the new file's content is pushed once, then edits flow back through the `updateListener` without ping-ponging.
4. **Updates back into React happen via `updateListener.of(...)`** calling `setContent(update.state.doc.toString())`. Don't introduce a parallel React-side sync.
5. **Both panes stay mounted in SPLIT mode**; `EDIT` and `PREVIEW` hide the other half via `hidden` + `!w-full`. Don't replace this with conditional rendering — see invariant 2.

## Adding CodeMirror extensions

- Append to `extensions: [...]` in the construction effect.
- For extensions that need to react to changing React props (theme toggle, etc.), use a [`Compartment`](https://codemirror.net/docs/ref/#state.Compartment) and `editorRef.current.dispatch({ effects: compartment.reconfigure(...) })`. Do *not* add the prop to the construction effect's dep array.
- New language support → import from `@codemirror/lang-*`. The setup only loads `markdown()` currently.

## Preview pane

- `<ReactMarkdown>` with `remark-gfm`, `rehype-raw`, `rehype-highlight`.
- Styling: `github-markdown-css` (light variant currently hard-coded) and `highlight.js/styles/github.css`. The light-theme imports are tagged for future-dark-mode — don't remove them without a dark-mode plan.
- New remark/rehype plugins → append to the existing arrays. Don't build a parallel pipeline.

## EditorMode

`EditorMode.tsx` writes `editorMode` via `handleEditorModeChange` from `AppContext`. New modes start by adding a value to `EditorModeEnum` (`src/types/editor/editorEnums.ts`), then updating both this component and the visibility classes in `Editor.tsx`.

## Don'ts

- Don't swap CodeMirror for `react-simple-code-editor` or similar — the TODO comment about it is exploratory, not a decision.
- Don't add a debounce in `Editor.tsx` — autosave is already debounced in `AppProvider`.
- Don't read editor value from `editorRef.current.state.doc.toString()` for anything beyond the existing initial-push comparison; React `content` is the source of truth.
