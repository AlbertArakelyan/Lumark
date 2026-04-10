import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { EditorModeEnum } from '../types/editor/editorEnums.ts';
import { IFileInfo } from '../types/file/fileTypes.ts';

interface IAppContext {
  content: string;
  setContent: Dispatch<SetStateAction<string>>;
  editorMode: EditorModeEnum;
  handleEditorModeChange: (mode: EditorModeEnum) => void;
  files: IFileInfo[];
  selectFile: (fileName: string) => void;
  selectedFile: string | null;
  fetchFiles: () => Promise<void>;
}

export const AppContext = createContext<IAppContext>({} as IAppContext);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState('');
  const [editorMode, setEditorMode] = useState<EditorModeEnum>(EditorModeEnum.SPLIT);
  const [files, setFiles] = useState<IFileInfo[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const handleEditorModeChange = (mode: EditorModeEnum) => {
    setEditorMode(mode);
  };

  const selectFile = (fileName: string) => {
    setSelectedFile(fileName);
  };

  const fetchFiles = async () => {
    try {
      const loadedFiles = await invoke<IFileInfo[]>('load_files');
      setFiles(loadedFiles);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    const fetchFileContent = async () => {
      if (selectedFile) {
        try {
          const fileContent = await invoke<string>('load_content_by_name', { fileName: selectedFile });
          setContent(fileContent);
        } catch (error) {
          console.error('Error fetching file content:', error);
          setContent(''); // Default to empty string on error
        }
      }
    };

    fetchFileContent();
  }, [selectedFile]);

  useEffect(() => {
    const saveContent = async () => {
      if (selectedFile) {
        try {
          await invoke('save_content_by_name', { fileName: selectedFile, content });
        } catch (error) {
          console.error('Failed to save content:', error);
        }
      } else {
        console.warn('No file selected. Content not saved.');
      }

    };
    // Debounce save to avoid too frequent writes
    const timeoutId = setTimeout(saveContent, 500);
    return () => clearTimeout(timeoutId);
  }, [selectedFile, content]);

  // useEffect(() => {
  //   const loadContent = async () => {
  //     try {
  //       const savedContent = await invoke<string>('load_content');
  //       setContent(savedContent);
  //     } catch (error) {
  //       console.error('Failed to load content:', error);
  //       setContent(''); // Default to empty string on error
  //     }
  //   };

  //   loadContent();
  // }, []);

  // Auto-save content when it changes
  // useEffect(() => {
  //   const saveContent = async () => {
  //     try {
  //       await invoke('save_content', { content });
  //     } catch (error) {
  //       console.error('Failed to save content:', error);
  //     }
  //   };

  //   // Debounce save to avoid too frequent writes
  //   const timeoutId = setTimeout(saveContent, 500);
  //   return () => clearTimeout(timeoutId);
  // }, [content]);

  const value: IAppContext = {
    content,
    setContent,
    editorMode,
    handleEditorModeChange,
    files,
    selectFile,
    selectedFile,
    fetchFiles,
  };

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

