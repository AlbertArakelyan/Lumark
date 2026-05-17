# Rule: UI primitive components

**Scope**: `src/components/UI/` — Lumark's in-house UI library.
**Mirrored at**: `src/components/UI/CLAUDE.md` (authoritative).
**References**: `src/components/UI/Button/`, `src/components/UI/Input/`.

## When to add a component to `src/components/UI/`

- **Yes**: reusable presentational primitive (button, input, modal, textarea, card, badge, tooltip…). It has UI sense beyond any one feature.
- **No**: feature-specific markup (a file row, the editor toolbar). Keep that next to the feature.

Before writing new markup elsewhere, scan `src/components/UI/` first and reuse what exists. If a primitive is missing, add it here rather than reaching for an external UI library.

## The pattern (non-negotiable)

1. **File layout**: `<Name>/<Name>.tsx` + `<Name>/types.ts`. One folder per component. `export default` the component.
2. **`types.ts`** exports:
   - `I<Name>Props` (capital `I` prefix).
   - String-literal union types — `<Name>SizeType`, `<Name>VariantType`, `<Name>RoundedType`, `<Name>IconPositionType`, etc.
3. **`I<Name>Props` extends the native HTML attributes of the root element**:
   - `<button>` → `ButtonHTMLAttributes<HTMLButtonElement>`
   - `<input>` → `InputHTMLAttributes<HTMLInputElement>`
   - `<textarea>` → `TextareaHTMLAttributes<HTMLTextAreaElement>`
   - `<a>` → `AnchorHTMLAttributes<HTMLAnchorElement>`
   - plain `<div>` wrapper → `HTMLAttributes<HTMLDivElement>`
4. **Also extend `PropsWithChildren` only when the component renders children**. `Button` does; `Input` does not.
5. **Component is `FC<I<Name>Props>`**. Destructure your own named props, leave `...props` (or `...rest`) for spreading.
6. **Where `{...props}` goes**: onto the **root element by default**, or onto the **most semantically important element when the component wraps its root**. `Input` spreads onto its `<input>` inside a wrapper `<div>` because the `<input>` is what callers configure (`value`, `onChange`, `placeholder`, `type`…).
7. **Multiple `*ClassName` props** for flexibility — one per meaningful structural layer, named for its role: `wrapperClassName`, `labelClassName`, `buttonContainerClassName`, `buttonContentClassName`, `textareaClassName`, `iconWrapperClassName`. The plain destructured `className` is reserved for the root/most-important element so it composes with `{...props}`.
8. **Variant props are string-literal unions** mapped through a `Record<UnionType, string>` inside `useMemo`, with a fallback to a sensible default:
   ```ts
   const buttonSize = useMemo(() => {
     const sizeMapping: Record<ButtonSizeType, string> = { xs: '...', sm: '...', md: '...' };
     return sizeMapping[size] || sizeMapping.md;
   }, [size]);
   ```
9. **Styling is inline Tailwind utility classes**. No CSS modules, styled-components, CSS-in-JS, or external UI libs.
10. **Theme tokens**: use Tailwind variables defined in `src/assets/css/` — `bg-surface`, `text-text-color`, `border-border-color`, `bg-primary` (+ `-hover`/`-active`), `bg-danger`, `bg-success`, `bg-warning`, `bg-info`, `bg-secondary`, `text-danger`, etc. No hardcoded hex.

## Don'ts

- Don't import `react-icons` or large icon libraries — the project uses `lucide-react`.
- Don't add `forwardRef` unless a consumer actually needs the ref.
- Don't add a story or test file — no Storybook/test runner exists.
- Don't put emojis in component code.
