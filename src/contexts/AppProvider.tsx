import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useMemo, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { EditorModeEnum } from '../types/editor/editorEnums.ts';
import { IFileInfo } from '../types/file/fileTypes.ts';
import useDebounce from '../hooks/useDebounce.ts';

const SEARCH_DEBOUNCE_DELAY = 300;

interface IAppContext {
  content: string;
  setContent: Dispatch<SetStateAction<string>>;
  editorMode: EditorModeEnum;
  handleEditorModeChange: (mode: EditorModeEnum) => void;
  files: IFileInfo[];
  filteredFiles: IFileInfo[];
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  isSearching: boolean;
  selectFile: (fileName: string) => void;
  deleteFile: (fileName: string) => Promise<void>;
  selectedFile: string | null;
  fetchFiles: () => Promise<void>;
}

export const AppContext = createContext<IAppContext>({} as IAppContext);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState('');
  const [editorMode, setEditorMode] = useState<EditorModeEnum>(EditorModeEnum.SPLIT);
  const [files, setFiles] = useState<IFileInfo[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_DELAY);
  const normalizedSearchQuery = debouncedSearchQuery.trim().toLowerCase();

  const filteredFiles = useMemo(() => {
    if (!normalizedSearchQuery) {
      return files;
    }

    return files.filter((file) => file.file_name.toLowerCase().includes(normalizedSearchQuery));
  }, [files, normalizedSearchQuery]);

  const handleEditorModeChange = (mode: EditorModeEnum) => {
    setEditorMode(mode);
  };

  const selectFile = (fileName: string) => {
    setSelectedFile(fileName);
  };

  const deleteFile = async (fileName: string) => {
    try {
      await invoke('delete_file_by_name', { fileName });
      // Refresh the file list after deletion
      await fetchFiles();
      // If the deleted file was the selected one, clear the content and selection
      setSelectedFile((currentSelectedFile) => {
        if (currentSelectedFile === fileName) {
          setContent('');
          return null;
        }
        return currentSelectedFile;
      });
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
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
    filteredFiles,
    searchQuery,
    setSearchQuery,
    isSearching: Boolean(normalizedSearchQuery),
    selectFile,
    deleteFile,
    selectedFile,
    fetchFiles,
  };

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

