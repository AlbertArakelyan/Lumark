# Markdown Syntax Guide

A complete reference for writing in Markdown — from basic formatting to advanced features.

---

## Headings

Use `#` symbols to create headings. More `#` symbols mean smaller headings.

```markdown
# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6
```

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

---

## Text Formatting

```markdown
**Bold text**
*Italic text*
***Bold and italic***
~~Strikethrough~~
`Inline code`
```

**Bold text**
*Italic text*
***Bold and italic***
~~Strikethrough~~
`Inline code`

---

## Paragraphs and Line Breaks

To create a new paragraph, leave a blank line between text blocks.

```markdown
This is the first paragraph.

This is the second paragraph.
```

For a line break without a new paragraph, end a line with two spaces or use a backslash `\`.

```markdown
First line\
Second line
```

---

## Blockquotes

Use `>` to create blockquotes. Nest them by adding more `>` symbols.

```markdown
> This is a blockquote.
>
> > This is a nested blockquote.
```

> This is a blockquote.
>
> > This is a nested blockquote.

---

## Lists

### Unordered Lists

```markdown
- Item one
- Item two
  - Sub-item A
  - Sub-item B
- Item three
```

- Item one
- Item two
  - Sub-item A
  - Sub-item B
- Item three

### Ordered Lists

```markdown
1. First item
2. Second item
   1. Sub-item one
   2. Sub-item two
3. Third item
```

1. First item
2. Second item
   1. Sub-item one
   2. Sub-item two
3. Third item

### Task Lists

```markdown
- [x] Completed task
- [ ] Incomplete task
- [ ] Another task to do
```

- [x] Completed task
- [ ] Incomplete task
- [ ] Another task to do

---

## Links

### Inline Links

```markdown
[Visit Lumark](https://www.lumark.app/)
```

[Visit Lumark](https://www.lumark.app/)

### Links with Titles

```markdown
[Lumark Website](https://www.lumark.app/ "Go to Lumark")
```

[Lumark Website](https://www.lumark.app/ "Go to Lumark")

### Reference-Style Links

```markdown
[Lumark][lumark-ref]

[lumark-ref]: https://www.lumark.app/
```

[Lumark][lumark-ref]

[lumark-ref]: https://www.lumark.app/

### Autolinks

```markdown
<https://www.lumark.app/>
```

<https://www.lumark.app/>

---

## Images

### Basic Image

Use `![alt text](url)` to embed an image.

```markdown
![Lumark Logo](https://www.lumark.app/logo.png)
```

![Lumark Logo](https://www.lumark.app/logo.png)

### Image with Title

```markdown
![Lumark Logo](https://www.lumark.app/logo.png "Lumark App Logo")
```

![Lumark Logo](https://www.lumark.app/logo.png "Lumark App Logo")

### Linked Image (Clickable)

Wrap an image inside a link to make it clickable.

```markdown
[![Lumark Logo](https://www.lumark.app/logo.png)](https://www.lumark.app/)
```

[![Lumark Logo](https://www.lumark.app/logo.png)](https://www.lumark.app/)

### Reference-Style Image

```markdown
![Lumark Logo][logo]

[logo]: https://www.lumark.app/logo.png "Lumark Logo"
```

![Lumark Logo][logo]

[logo]: https://www.lumark.app/logo.png "Lumark Logo"

---

## Code

### Inline Code

```markdown
Use the `print()` function in Python.
```

Use the `print()` function in Python.

### Fenced Code Blocks

Use triple backticks with an optional language identifier for syntax highlighting.

````markdown
```python
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))
```
````

```python
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))
```

````markdown
```javascript
const greet = (name) => `Hello, ${name}!`;
console.log(greet("World"));
```
````

```javascript
const greet = (name) => `Hello, ${name}!`;
console.log(greet("World"));
```

---

## Tables

```markdown
| Feature       | Syntax          | Output         |
| ------------- | --------------- | -------------- |
| Bold          | `**text**`      | **text**       |
| Italic        | `*text*`        | *text*         |
| Code          | `` `code` ``    | `code`         |
| Link          | `[title](url)`  | [title](url)   |
```

| Feature       | Syntax          | Output         |
| ------------- | --------------- | -------------- |
| Bold          | `**text**`      | **text**       |
| Italic        | `*text*`        | *text*         |
| Code          | `` `code` ``    | `code`         |
| Link          | `[title](url)`  | [title](url)   |

### Column Alignment

```markdown
| Left-aligned | Center-aligned | Right-aligned |
| :----------- | :------------: | ------------: |
| Content      | Content        | Content       |
| More         | More           | More          |
```

| Left-aligned | Center-aligned | Right-aligned |
| :----------- | :------------: | ------------: |
| Content      | Content        | Content       |
| More         | More           | More          |

---

## Horizontal Rules

Use three or more dashes, asterisks, or underscores.

```markdown
---
***
___
```

---

## Escaping Characters

Use a backslash `\` to display characters that normally have special meaning in Markdown.

```markdown
\*This is not italic\*
\# This is not a heading
\[This is not a link\]
```

\*This is not italic\*
\# This is not a heading
\[This is not a link\]

Escapable characters: `\` `` ` `` `*` `_` `{ }` `[ ]` `( )` `#` `+` `-` `.` `!` `|`

---

## Footnotes

```markdown
Here is a statement with a footnote.[^1]

[^1]: This is the footnote content.
```

Here is a statement with a footnote.[^1]

[^1]: This is the footnote content.

---

## Definition Lists

```markdown
Markdown
: A lightweight markup language for creating formatted text.

Lumark
: A modern app built around Markdown. Visit [lumark.app](https://www.lumark.app/).
```

Markdown
: A lightweight markup language for creating formatted text.

Lumark
: A modern app built around Markdown. Visit [lumark.app](https://www.lumark.app/).

---

## Collapsed Sections (Details/Summary)

> Note: This uses Markdown-compatible syntax supported by GitHub and many renderers.

```markdown
<details>
<summary>Click to expand</summary>

Hidden content goes here.

</details>
```

---

## Emoji (Shortcodes)

Supported by GitHub and many Markdown renderers.

```markdown
:smile: :rocket: :thumbsup: :heart:
```

:smile: :rocket: :thumbsup: :heart:

---

## Quick Reference Card

| Element        | Syntax                                |
| -------------- | ------------------------------------- |
| Heading        | `# H1` `## H2` `### H3`             |
| Bold           | `**bold**`                            |
| Italic         | `*italic*`                            |
| Blockquote     | `> quote`                             |
| Ordered List   | `1. item`                             |
| Unordered List | `- item`                              |
| Code           | `` `code` ``                          |
| Link           | `[text](url)`                         |
| Image          | `![alt](url)`                         |
| Linked Image   | `[![alt](img-url)](link-url)`         |
| Horizontal Rule| `---`                                 |
| Table          | `\| col \| col \|`                    |
| Footnote       | `text[^1]` / `[^1]: note`            |
| Task List      | `- [x] done` / `- [ ] todo`          |
| Strikethrough  | `~~text~~`                            |

---

## Keyboard Shortcuts

Lumark's editor can apply common formatting for you. Formatting shortcuts wrap the selected text, or insert an empty pair with the cursor inside when nothing is selected. Pressing the same shortcut again removes the formatting. On macOS use `Cmd` instead of `Ctrl`.

| Action         | Shortcut           | Result                    |
| -------------- | ------------------ | ------------------------- |
| Bold           | `Ctrl+B`           | `**text**`                |
| Italic         | `Ctrl+I`           | `*text*`                  |
| Underline      | `Ctrl+U`           | `<u>text</u>`             |
| Strikethrough  | `Ctrl+Shift+X`     | `~~text~~`                |
| Inline code    | `Ctrl+E`           | `` `text` ``              |
| Link           | `Ctrl+K`           | `[text](url)`             |
| Indent         | `Tab`              | Indents the selected lines |
| Outdent        | `Shift+Tab`        | Outdents the selected lines |

Pasting a URL over selected text turns it into a link, and pressing `Enter` inside a list continues it.

---

*Built with Markdown. Powered by [![Lumark](https://www.lumark.app/logo.png)](https://www.lumark.app/)*