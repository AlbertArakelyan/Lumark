import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { EditorView } from '@codemirror/view';
import { Compartment, EditorState, Prec } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { basicSetup } from 'codemirror';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { githubLight } from '@fsegurai/codemirror-theme-github-light';
import { githubDark } from '@fsegurai/codemirror-theme-github-dark';
// Inlined as strings and swapped in a <style> tag: the combined github-markdown.css
// only follows prefers-color-scheme, so it can't track the in-app toggle.
// Reference: https://github.com/sindresorhus/github-markdown-css
import markdownLightCss from 'github-markdown-css/github-markdown-light.css?inline';
import markdownDarkCss from 'github-markdown-css/github-markdown-dark.css?inline';
import highlightLightCss from 'highlight.js/styles/github.css?inline';
import highlightDarkCss from 'highlight.js/styles/github-dark.css?inline';

import { useAppContext } from '../../contexts/AppProvider.tsx';
import { EditorModeEnum } from '../../types/editor/editorEnums.ts';
import { ThemeEnum } from '../../types/theme/themeEnums.ts';

const themeCompartment = new Compartment();

const getEditorTheme = (theme: ThemeEnum) => (theme === ThemeEnum.DARK ? githubDark : githubLight);

// The GitHub themes paint their own backgrounds (#0d1117 in dark), which don't match the app
// surface. This keeps their syntax colours but lets the editor sit on the same page as the UI.
// Highest precedence so it wins over whichever theme the compartment holds.
const surfaceTheme = Prec.highest(EditorView.theme({
  '&': { backgroundColor: 'transparent', fontSize: '14px' },
  '&.cm-focused': { outline: 'none' },
  '.cm-scroller': { lineHeight: '1.7' },
  '.cm-content': { padding: '16px 0' },
  '.cm-gutters': {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--muted-text)',
  },
  '.cm-activeLineGutter': { backgroundColor: 'transparent', color: 'var(--text-color)' },
}));

// Try also react-simple-code-editor [https://www.npmjs.com/package/react-simple-code-editor]
// inside a new Editor.tsx (Editor2.tsx) component and compare
// Consider last published 2 years ago, meanwhile code mirror is actively being updated

const Editor = () => {
  const { content, setContent, editorMode, selectedFile, theme } = useAppContext();

  const [isEditorContentSetInitially, setIsEditorContentSetInitially] = useState(false);

  const editorRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) {
      const startState = EditorState.create({
        doc: content || '',
        extensions: [
          basicSetup,
          EditorView.lineWrapping,
          markdown(),
          themeCompartment.of(getEditorTheme(theme)),
          surfaceTheme,
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              setContent(update.state.doc.toString());
            }
          }),
        ],
      });

      const editor = new EditorView({
        state: startState,
        parent: document.getElementById('editor-container')!,
      });

      editorRef.current = editor;
    }

    return () => {
      if (editorRef.current) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.state.doc.toString() && !isEditorContentSetInitially) {
      editorRef.current.dispatch({
        changes: {
          from: 0,
          to: editorRef.current.state.doc.length,
          insert: content || '',
        },
      });

      setIsEditorContentSetInitially(true);
    }
  }, [content, isEditorContentSetInitially]);

  useEffect(() => {
    setIsEditorContentSetInitially(false);
  }, [selectedFile]);

  useEffect(() => {
    editorRef.current?.dispatch({
      effects: themeCompartment.reconfigure(getEditorTheme(theme)),
    });
  }, [theme]);

  const previewCss = theme === ThemeEnum.DARK
    ? markdownDarkCss + highlightDarkCss
    : markdownLightCss + highlightLightCss;

  return (
    <>
      <style>{previewCss}</style>
      <div className="flex items-stretch min-h-full">
        <div className={`w-1/2 min-w-0 pr-2 ${editorMode === EditorModeEnum.SPLIT ? 'border-r border-border-color' : ''} ${editorMode === EditorModeEnum.PREVIEW ? 'hidden' : ''} ${editorMode === EditorModeEnum.EDIT ? '!w-full' : ''}`}>
          <div id="editor-container"></div>
        </div>
        <div className={`w-1/2 min-w-0 px-8 py-6 ${editorMode === EditorModeEnum.EDIT ? 'hidden' : ''} ${editorMode === EditorModeEnum.PREVIEW ? '!w-full' : ''}`}>
          <article className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeHighlight]}
            >
              {content}
            </ReactMarkdown>
          </article>
        </div>
      </div>
    </>
  );
};

export default Editor;
