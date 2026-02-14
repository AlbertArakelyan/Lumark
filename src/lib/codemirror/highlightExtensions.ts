// Dark custom theme
import { EditorView } from '@codemirror/view';
import { HighlightStyle, tags } from '@codemirror/highlight';

export const luxuryDarkTheme = EditorView.theme({
  '&': {
    color: '#e0e0e0',
    backgroundColor: '#1a1a1a',
    fontSize: '15px',
    fontFamily: "'Inter', 'SF Pro Display', -apple-system, system-ui, sans-serif",
  },
  '.cm-content': {
    caretColor: '#a78bfa',
    padding: '20px 0',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: '#a78bfa',
    borderLeftWidth: '2px',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: '#a78bfa30',
  },
  '.cm-activeLine': {
    backgroundColor: '#ffffff08',
  },
  '.cm-gutters': {
    backgroundColor: '#161616',
    color: '#666',
    border: 'none',
    borderRight: '1px solid #2a2a2a',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#ffffff08',
    color: '#a78bfa',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 16px 0 8px',
    minWidth: '40px',
  },
}, { dark: true });

export const luxuryDarkSyntaxHighlighting = HighlightStyle.define([
  { tag: tags.heading1, fontSize: '1.6em', fontWeight: '700', color: '#a78bfa' },
  { tag: tags.heading2, fontSize: '1.4em', fontWeight: '600', color: '#c4b5fd' },
  { tag: tags.heading3, fontSize: '1.2em', fontWeight: '600', color: '#ddd6fe' },
  { tag: tags.link, color: '#60a5fa', textDecoration: 'underline' },
  { tag: tags.emphasis, fontStyle: 'italic', color: '#fbbf24' },
  { tag: tags.strong, fontWeight: 'bold', color: '#f87171' },
  { tag: tags.keyword, color: '#ec4899' },
  { tag: tags.string, color: '#34d399' },
  { tag: tags.comment, color: '#6b7280', fontStyle: 'italic' },
]);

// Light custom theme
export const luxuryLightTheme = EditorView.theme({
  '&': {
    color: '#1a1a1a',
    backgroundColor: '#ffffff',
    fontSize: '15px',
    fontFamily: "'Inter', 'SF Pro Display', -apple-system, system-ui, sans-serif",
  },
  '.cm-content': {
    caretColor: '#7c3aed',
    padding: '20px 0',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: '#7c3aed',
    borderLeftWidth: '2px',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: '#a78bfa25',
  },
  '.cm-activeLine': {
    backgroundColor: '#f8f7ff',
  },
  '.cm-gutters': {
    backgroundColor: '#fafafa',
    color: '#9ca3af',
    border: 'none',
    borderRight: '1px solid #e5e7eb',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#f8f7ff',
    color: '#7c3aed',
  },
  '.cm-lineNumbers .cm-gutterElement': {
    padding: '0 16px 0 8px',
    minWidth: '40px',
  },
}, { dark: false });

export const luxuryLightSyntaxHighlighting = HighlightStyle.define([
  { tag: tags.heading1, fontSize: '1.6em', fontWeight: '700', color: '#7c3aed' },
  { tag: tags.heading2, fontSize: '1.4em', fontWeight: '600', color: '#8b5cf6' },
  { tag: tags.heading3, fontSize: '1.2em', fontWeight: '600', color: '#a78bfa' },
  { tag: tags.link, color: '#2563eb', textDecoration: 'underline' },
  { tag: tags.emphasis, fontStyle: 'italic', color: '#d97706' },
  { tag: tags.strong, fontWeight: 'bold', color: '#dc2626' },
  { tag: tags.keyword, color: '#db2777' },
  { tag: tags.string, color: '#059669' },
  { tag: tags.comment, color: '#9ca3af', fontStyle: 'italic' },
  { tag: tags.atom, color: '#7c3aed' },
  { tag: tags.number, color: '#ea580c' },
  { tag: tags.meta, color: '#0891b2' },
]);
