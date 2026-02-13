import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { markdown } from '@codemirror/lang-markdown';
import { basicSetup } from 'codemirror';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';
import 'github-markdown-css/github-markdown-light.css'; // WHen dark theme is set up change with general github-markdown.css

// Try also react-simple-code-editor [https://www.npmjs.com/package/react-simple-code-editor]
// inside a new Editor.tsx (Editor2.tsx) component and compare
// Consider last published 2 years ago, meanwhile code mirror is actively being updated

const Editor = () => {
  const [content, setContent] = useState('');
  const editorRef = useRef<EditorView | null>(null);

  useEffect(() => {
    if (!editorRef.current) {
      const startState = EditorState.create({
        doc: '',
        extensions: [
          basicSetup,
          markdown(),
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

  return (
    <div className="flex items-start justify-between gap-2 p-2">
      <div className="w-1/2">
        <div id="editor-container"></div>
      </div>
      <div className="w-1/2">
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
  );
};

export default Editor;
