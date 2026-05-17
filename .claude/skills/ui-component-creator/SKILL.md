---
name: ui-component-creator
description: Use when the user wants a new reusable UI primitive under `src/components/UI/` — Button, Input, Modal, Textarea, Card, Badge, Tooltip, etc. Also use when extracting feature-local markup into a shared UI primitive. Triggers on phrases like "add a Textarea component", "create a Modal UI primitive", "extract this into a shared UI component". Enforces the pattern documented in `src/components/UI/CLAUDE.md` and `.claude/rules/ui-components.md`.
---

# UI component creator

You're creating (or refactoring) a reusable UI primitive. The pattern is non-negotiable — Lumark's UI primitives compose because they all look the same.

## Read the authoritative sources first

- `src/components/UI/CLAUDE.md` — full pattern, scoped to this folder.
- `.claude/rules/ui-components.md` — mirrored standalone reference.
- `src/components/UI/Button/Button.tsx` + `Button/types.ts` — canonical reference (component with children).
- `src/components/UI/Input/Input.tsx` + `Input/types.ts` — canonical reference (no children, spreads onto a wrapped element).

## Decide first: does this belong in UI?

- **Yes**: reusable presentational primitive with UI sense beyond any one feature (button, input, modal, card, badge, tooltip).
- **No**: feature-specific markup (a file row, the editor toolbar). Keep it next to the feature.

If unsure, ask the user.

## Scaffold

Create exactly two files:

```
src/components/UI/<Name>/<Name>.tsx
src/components/UI/<Name>/types.ts
```

### `types.ts` template

```ts
import { <RootHTMLAttributes>, PropsWithChildren, ReactNode } from 'react';

export type <Name>SizeType = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type <Name>VariantType = 'primary' | 'secondary' | /* ... */;
export type <Name>RoundedType = 'default' | 'rounded';

export interface I<Name>Props
  extends <PropsWithChildren,>  // only if renders children
          <RootHTMLAttributes><HTMLElement> {
  size?: <Name>SizeType;
  variant?: <Name>VariantType;
  rounded?: <Name>RoundedType;
  // ... per-element className props (see below)
}
```

### `<Name>.tsx` skeleton

```tsx
import { FC, useMemo } from 'react';
import { I<Name>Props, <Name>SizeType, <Name>VariantType, <Name>RoundedType } from './types';

const <Name>: FC<I<Name>Props> = ({
  // destructure your own named props with sensible defaults
  size = 'md',
  variant = 'primary',
  rounded = 'default',
  wrapperClassName = '',
  className = '',
  ...props
}) => {
  const elSize = useMemo(() => {
    const sizeMapping: Record<<Name>SizeType, string> = {
      xs: '...', sm: '...', md: '...', lg: '...', xl: '...',
    };
    return sizeMapping[size] || sizeMapping.md;
  }, [size]);

  // ... other useMemo'd variant mappings

  return (
    <div className={`${wrapperClassName}`}>
      <element
        className={`${elSize} ${className}`}
        {...props}
      />
    </div>
  );
};

export default <Name>;
```

## Rules (non-negotiable)

1. **`I<Name>Props` extends the native HTML attributes of the root element**:
   - `<button>` → `ButtonHTMLAttributes<HTMLButtonElement>`
   - `<input>` → `InputHTMLAttributes<HTMLInputElement>`
   - `<textarea>` → `TextareaHTMLAttributes<HTMLTextAreaElement>`
   - `<a>` → `AnchorHTMLAttributes<HTMLAnchorElement>`
   - plain `<div>` wrapper → `HTMLAttributes<HTMLDivElement>`
2. **Also extend `PropsWithChildren` only when the component renders children.** Button yes, Input no.
3. **`{...props}` placement**: onto the root element by default, **or** onto the most semantically important element when the component wraps its root. `Input` spreads onto its inner `<input>` because that's what callers configure.
4. **Multiple `*ClassName` props** for flexibility — one per meaningful structural layer. Names follow the structural role: `wrapperClassName`, `labelClassName`, `buttonContainerClassName`, `buttonContentClassName`, `textareaClassName`. The plain destructured `className` is reserved for the root/most-important element.
5. **Variant props are string-literal unions** mapped via `Record<UnionType, string>` inside `useMemo` with a sensible default fallback. Never sprinkle ternaries inline.
6. **Inline Tailwind utility classes only.** No CSS modules, styled-components, CSS-in-JS, or external UI libs.
7. **Use theme tokens from `src/assets/css/`**: `bg-surface`, `text-text-color`, `border-border-color`, `bg-primary` (+ `-hover` / `-active`), `bg-danger`, `bg-success`, `bg-warning`, `bg-info`, `bg-secondary`, `text-danger`. Don't hardcode hex colors.
8. **Icons**: use `lucide-react` (already a dep). Don't import `react-icons` or other icon libs.
9. **No tests, no stories, no emojis** in component code.

## Verification

After writing, run `yarn lint` from the repo root and fix any errors before reporting back.

## Delegation

For non-trivial components, consider delegating to the `ui-component-author` subagent (`.claude/agents/ui-component-author.md`) which has the same context in a separate window.
