# Editor — rules

The editor mounts **CodeMirror 6 imperatively** alongside a **react-markdown** preview, both driven by the same `content` string from `AppContext`. The lifecycle has a few invariants that are easy to break.

## Invariants you must preserve

1. **CodeMirror is constructed once.** The construction effect in `Editor.tsx` has an empty dep array intentionally. Do not add deps to it — recreating the `EditorView` on every render leaks DOM and destroys cursor state.
2. **The `#editor-container` DOM node is the mount point.** It's a single `<div>` and CodeMirror appends into it. Don't conditionally unmount the wrapper based on `editorMode` — visibility is controlled via Tailwind `hidden`, not unmount, so the CodeMirror instance survives mode switches.
3. **`isEditorContentSetInitially` gates the initial doc push** from React `content` → CodeMirror. It's reset to `false` whenever `selectedFile` changes so the new file's content is pushed once, then ongoing edits flow back through the `updateListener` without ping-ponging.
4. **Updates back into React happen via the `updateListener.of(...)` extension**, calling `setContent(update.state.doc.toString())`. Don't introduce a parallel React-side sync — you'll get an autosave/reload loop.
5. **Both panes stay mounted in `SPLIT` mode**; `EDIT` and `PREVIEW` modes hide the other half via Tailwind `hidden` + `!w-full`. Don't replace this with conditional rendering — see invariant 2.

## Adding CodeMirror extensions

- Append to the `extensions: [...]` array in the construction effect.
- If the extension needs to react to changing React props (e.g. theme toggle), use a [`Compartment`](https://codemirror.net/docs/ref/#state.Compartment) and `editorRef.current.dispatch({ effects: compartment.reconfigure(...) })`. Do *not* add the prop to the construction effect's dep array.
- New language support → import from `@codemirror/lang-*`. The current setup only loads `markdown()`.

## Preview pane

- Renders through `<ReactMarkdown>` with `remark-gfm`, `rehype-raw`, `rehype-highlight`.
- Styling comes from `github-markdown-css` (light variant currently hard-coded) and `highlight.js/styles/github.css`. The light-theme imports are noted in inline comments as future-dark-mode targets — don't rip them out without a dark-mode story.
- If you add a new remark/rehype plugin, add it to the appropriate array — don't introduce a custom markdown pipeline.

## EditorMode

`EditorMode.tsx` is the mode-switcher UI. It writes to `editorMode` via `handleEditorModeChange` from `AppContext`. New modes start by adding a value to `EditorModeEnum` in `src/types/editor/editorEnums.ts`, then both this component and the visibility classes in `Editor.tsx`.

## Don'ts

- Don't swap CodeMirror for `react-simple-code-editor` or similar — the in-code TODO comment mentioning it is exploratory, not a decision.
- Don't add a debounce in `Editor.tsx` — autosave is already debounced in `AppProvider`. A second debounce would compound the delay.
- Don't read the editor's value from `editorRef.current.state.doc.toString()` for anything except the existing comparison in the initial-push effect; the React `content` state is the source of truth everywhere else.
