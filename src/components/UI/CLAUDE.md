# UI primitives — rules

This folder is Lumark's in-house UI library. Every component in here must follow the same shape so they compose predictably.

## When to add a component here

- **Yes**: the element is a reusable presentational primitive (button, input, modal, textarea, card, badge, tooltip, etc.). It has UI sense outside any one feature.
- **No**: the markup is feature-specific (a file row, the editor toolbar, a sidebar header) — keep it next to the feature.

Before writing new markup elsewhere, scan this folder first and reuse what exists. If a primitive is *missing*, add it here rather than reaching for an external UI library.

## The pattern (non-negotiable)

References: `Button/Button.tsx` + `Button/types.ts`, `Input/Input.tsx` + `Input/types.ts`. Match them.

1. **File layout**: `<Name>/<Name>.tsx` + `<Name>/types.ts`. One folder per component. `export default` the component.
2. **`types.ts`** exports:
   - `I<Name>Props` (capital `I` prefix).
   - String-literal union types the component exposes — `<Name>SizeType`, `<Name>VariantType`, `<Name>RoundedType`, `<Name>IconPositionType`, etc.
3. **`I<Name>Props` extends the native HTML attributes of the root element**:
   - `<button>` → `ButtonHTMLAttributes<HTMLButtonElement>`
   - `<input>` → `InputHTMLAttributes<HTMLInputElement>`
   - `<textarea>` → `TextareaHTMLAttributes<HTMLTextAreaElement>`
   - `<a>` → `AnchorHTMLAttributes<HTMLAnchorElement>`
   - plain `<div>` wrapper → `HTMLAttributes<HTMLDivElement>`
4. **Also extend `PropsWithChildren` only when the component renders children**. `Button` does; `Input` does not.
5. **Component is `FC<I<Name>Props>`**. Destructure your own named props, leave `...props` (or `...rest`) for spreading.
6. **Where `{...props}` goes**: onto the **root element by default**, or onto the **most semantically important element when the component wraps its root**. `Input` spreads onto the `<input>` inside its wrapper `<div>` because `<input>` is what callers actually configure (`value`, `onChange`, `placeholder`, `type`...).
7. **Multiple `*ClassName` props** for flexibility — one per meaningful structural layer, named for its role: `wrapperClassName`, `labelClassName`, `buttonContainerClassName`, `buttonContentClassName`, `textareaClassName`, `iconWrapperClassName`. The plain destructured `className` is reserved for the root/most-important element so it composes with `{...props}`.
8. **Variant props are string-literal unions** mapped through a `Record<UnionType, string>` inside `useMemo`, with a fallback to a sensible default:
   ```ts
   const buttonSize = useMemo(() => {
     const sizeMapping: Record<ButtonSizeType, string> = { xs: '...', sm: '...', md: '...' };
     return sizeMapping[size] || sizeMapping.md;
   }, [size]);
   ```
9. **Styling is inline Tailwind utility classes**. No CSS modules, no styled-components, no CSS-in-JS, no external UI libs.
10. **Theme tokens**: use the custom Tailwind variables defined in `src/assets/css/` — `bg-surface`, `text-text-color`, `border-border-color`, `bg-primary` (+ `-hover`/`-active` variants), `bg-danger`, `bg-success`, `bg-warning`, `bg-info`, `bg-secondary`, `text-danger`, etc. Don't hardcode hex colors.

## Don'ts

- Don't import from `react-icons` or large icon libraries — the project uses `lucide-react`.
- Don't add `forwardRef` unless a consumer actually needs the ref (none currently do).
- Don't add a story/test file — there's no Storybook or test runner in this repo.
- Don't put any emojis in component code.
