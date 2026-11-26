import { keymap } from '@codemirror/view';
import { EditorSelection, Prec, StateCommand } from '@codemirror/state';
import { indentLess, indentMore } from '@codemirror/commands';
import { indentUnit } from '@codemirror/language';

// With no selection, Tab inserts an indent unit at the cursor instead of indenting the whole
// line (CodeMirror's indentMore), so a Tab mid-sentence behaves like a normal text editor.
const insertIndentOrIndentSelection: StateCommand = ({ state, dispatch }) => {
  if (state.selection.ranges.some((range) => !range.empty)) {
    return indentMore({ state, dispatch });
  }

  dispatch(state.update(state.replaceSelection(state.facet(indentUnit)), {
    scrollIntoView: true,
    userEvent: 'input',
  }));

  return true;
};

interface IInlineFormat {
  open: string;
  close: string;
  // Given the shortest run of `open[0]` on both sides of the text, decides whether this format
  // is applied. Needed because `*` (italic) and `**` (bold) share a character: a run of 2 is
  // bold only, a run of 3 is both.
  isAppliedForRun?: (run: number) => boolean;
}

const BOLD: IInlineFormat = { open: '**', close: '**', isAppliedForRun: (run) => run >= 2 };
const ITALIC: IInlineFormat = { open: '*', close: '*', isAppliedForRun: (run) => run % 2 === 1 };
const STRIKETHROUGH: IInlineFormat = { open: '~~', close: '~~', isAppliedForRun: (run) => run >= 2 };
const INLINE_CODE: IInlineFormat = { open: '`', close: '`', isAppliedForRun: (run) => run >= 1 };
const UNDERLINE: IInlineFormat = { open: '<u>', close: '</u>' };

const LOOKAROUND = 3;

const leadingRun = (text: string, char: string) => {
  let count = 0;
  while (count < text.length && text[count] === char) count++;
  return count;
};

const trailingRun = (text: string, char: string) => leadingRun([...text].reverse().join(''), char);

const isWrapped = (format: IInlineFormat, before: string, after: string) => {
  if (!format.isAppliedForRun) {
    return before.endsWith(format.open) && after.startsWith(format.close);
  }

  const char = format.open[0];
  const run = Math.min(trailingRun(before, char), leadingRun(after, char));

  return run > 0 && format.isAppliedForRun(run);
};

const isSelectionWrapped = (format: IInlineFormat, selected: string) => {
  if (selected.length <= format.open.length + format.close.length) {
    return false;
  }

  if (!format.isAppliedForRun) {
    return selected.startsWith(format.open) && selected.endsWith(format.close);
  }

  const char = format.open[0];
  const run = Math.min(leadingRun(selected, char), trailingRun(selected, char));

  return run > 0 && format.isAppliedForRun(run);
};

// Toggles an inline format on every selection range. Unwraps when the markers are either part of
// the selection (`**bold**` selected) or sit right outside it (`bold` selected, or the cursor in
// `**|**`); otherwise wraps the selection, or inserts an empty pair with the cursor inside.
const toggleInlineFormat = (format: IInlineFormat): StateCommand => ({ state, dispatch }) => {
  const { open, close } = format;

  const transaction = state.changeByRange((range) => {
    const { from, to } = range;
    const selected = state.sliceDoc(from, to);

    if (isSelectionWrapped(format, selected)) {
      return {
        changes: [
          { from, to: from + open.length },
          { from: to - close.length, to },
        ],
        range: EditorSelection.range(from, to - open.length - close.length),
      };
    }

    const before = state.sliceDoc(Math.max(0, from - Math.max(LOOKAROUND, open.length)), from);
    const after = state.sliceDoc(to, to + Math.max(LOOKAROUND, close.length));

    if (isWrapped(format, before, after)) {
      return {
        changes: [
          { from: from - open.length, to: from },
          { from: to, to: to + close.length },
        ],
        range: EditorSelection.range(from - open.length, to - open.length),
      };
    }

    return {
      changes: [
        { from, insert: open },
        { from: to, insert: close },
      ],
      range: EditorSelection.range(from + open.length, to + open.length),
    };
  });

  dispatch(state.update(transaction, { scrollIntoView: true, userEvent: 'input.format' }));

  return true;
};

// Wraps the selection as the link text and selects the `url` placeholder so it can be typed over.
// With no selection the cursor lands between the brackets instead.
const insertLink: StateCommand = ({ state, dispatch }) => {
  const placeholder = 'url';

  const transaction = state.changeByRange((range) => {
    const { from, to } = range;
    const text = state.sliceDoc(from, to);
    const insert = `[${text}](${placeholder})`;
    const placeholderFrom = from + text.length + 3;

    return {
      changes: { from, to, insert },
      range: range.empty
        ? EditorSelection.cursor(from + 1)
        : EditorSelection.range(placeholderFrom, placeholderFrom + placeholder.length),
    };
  });

  dispatch(state.update(transaction, { scrollIntoView: true, userEvent: 'input.format' }));

  return true;
};

// Prec.high so these win over basicSetup's defaults, which bind Mod-i (select parent syntax) and
// Mod-u (undo selection).
export const editorKeymap = Prec.high(keymap.of([
  { key: 'Tab', run: insertIndentOrIndentSelection, shift: indentLess },
  { key: 'Mod-b', run: toggleInlineFormat(BOLD), preventDefault: true },
  { key: 'Mod-i', run: toggleInlineFormat(ITALIC), preventDefault: true },
  { key: 'Mod-u', run: toggleInlineFormat(UNDERLINE), preventDefault: true },
  { key: 'Mod-Shift-x', run: toggleInlineFormat(STRIKETHROUGH), preventDefault: true },
  { key: 'Mod-e', run: toggleInlineFormat(INLINE_CODE), preventDefault: true },
  { key: 'Mod-k', run: insertLink, preventDefault: true },
]));
