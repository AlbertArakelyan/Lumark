---
description: Scaffold a new reusable UI primitive under src/components/UI/ following the project pattern.
argument-hint: <ComponentName> [<root-html-tag>]
allowed-tools: Read, Edit, Write, Glob, Grep, Agent
---

Scaffold a new UI primitive at `src/components/UI/$1/` following the project's UI pattern.

Arguments: `$ARGUMENTS`
- `$1` = component name in PascalCase (e.g. `Textarea`, `Modal`, `Card`)
- `$2` = optional root HTML tag (e.g. `textarea`, `div`, `dialog`). If omitted, infer from the name.

Delegate to the `ui-component-author` subagent. Hand it:
- The exact `$1` name and (if given) the `$2` root element.
- A reminder to read `src/components/UI/Button/` and `src/components/UI/Input/` first as the canonical reference.
- Instruction to produce `<Name>.tsx` + `types.ts`, with `I<Name>Props` extending the right `*HTMLAttributes<...>` and `PropsWithChildren` only when the element renders children.
- Instruction to run `yarn lint` after writing.

Do not implement the component yourself — delegate.
