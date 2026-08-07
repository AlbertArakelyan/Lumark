import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { basicSetup } from 'codemirror';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import { githubLight } from '@fsegurai/codemirror-theme-github-light'; // When dark theme is set up change with @fsegurai/codemirror-theme-github-dark
import 'highlight.js/styles/github.css';
import 'github-markdown-css/github-markdown-light.css'; // TODO: remove light theme and leave ordinary one, for supporting both themes.
// Reference: https://github.com/sindresorhus/github-markdown-css

import { useAppContext } from '../../contexts/AppProvider.tsx';
import { EditorModeEnum } from '../../types/editor/editorEnums.ts';

// Try also react-simple-code-editor [https://www.npmjs.com/package/react-simple-code-editor]
// inside a new Editor.tsx (Editor2.tsx) component and compare
// Consider last published 2 years ago, meanwhile code mirror is actively being updated

const Editor = () => {
  const { content, setContent, editorMode, selectedFile } = useAppContext();

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
          githubLight,
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
    console.log('selectedFile', selectedFile);

    setIsEditorContentSetInitially(false);
  }, [selectedFile]);

  return (
    <>
      <div className="flex items-start justify-between gap-2 p-2">
        <div className={`w-1/2 min-w-0 ${editorMode === EditorModeEnum.PREVIEW ? 'hidden' : ''} ${editorMode === EditorModeEnum.EDIT ? '!w-full' : ''}`}>
          <div id="editor-container"></div>
        </div>
        <div className={`w-1/2 min-w-0 ${editorMode === EditorModeEnum.EDIT ? 'hidden' : ''} ${editorMode === EditorModeEnum.PREVIEW ? '!w-full' : ''}`}>
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
