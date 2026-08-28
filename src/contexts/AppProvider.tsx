import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { EditorModeEnum } from '../types/editor/editorEnums.ts';
import { IFileInfo } from '../types/file/fileTypes.ts';
import { IFolderInfo } from '../types/folder/folderTypes.ts';
import useDebounce from '../hooks/useDebounce.ts';

const SEARCH_DEBOUNCE_DELAY = 300;
const SAVE_DEBOUNCE_DELAY = 500;
const DEFAULT_FOLDER_NAME = 'general';

// Identity of the buffer currently held in `content`. The autosave effect writes
// only when this matches the live selection, so a folder or file switch can
// never flush the previous note's buffer into the newly selected path.
const buildContentKey = (folderName: string | null, fileName: string | null) => (
  folderName && fileName ? `${folderName}/${fileName}` : ''
);

interface IAppContext {
  content: string;
  setContent: Dispatch<SetStateAction<string>>;
  editorMode: EditorModeEnum;
  handleEditorModeChange: (mode: EditorModeEnum) => void;
  folders: IFolderInfo[];
  selectedFolder: string | null;
  selectFolder: (folderName: string) => void;
  addFolder: (folderName: string) => Promise<void>;
  renameFolder: (oldFolderName: string, newFolderName: string) => Promise<void>;
  deleteFolder: (folderName: string) => Promise<void>;
  fetchFolders: () => Promise<IFolderInfo[]>;
  files: IFileInfo[];
  filteredFiles: IFileInfo[];
  searchQuery: string;
  setSearchQuery: Dispatch<SetStateAction<string>>;
  isSearching: boolean;
  selectFile: (fileName: string) => void;
  addFile: (fileName: string) => Promise<void>;
  deleteFile: (fileName: string) => Promise<void>;
  renameFile: (oldFileName: string, newFileName: string) => Promise<void>;
  selectedFile: string | null;
  fetchFiles: (folderName: string) => Promise<void>;
}

export const AppContext = createContext<IAppContext>({} as IAppContext);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState('');
  const [editorMode, setEditorMode] = useState<EditorModeEnum>(EditorModeEnum.SPLIT);
  const [folders, setFolders] = useState<IFolderInfo[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [files, setFiles] = useState<IFileInfo[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const contentKeyRef = useRef('');
  const filesRequestRef = useRef(0);

  const debouncedSearchQuery = useDebounce(searchQuery, SEARCH_DEBOUNCE_DELAY);
  const normalizedSearchQuery = debouncedSearchQuery.trim().toLowerCase();

  // `files` only ever holds the selected folder's notes, so this is already
  // folder-scoped search.
  const filteredFiles = useMemo(() => {
    if (!normalizedSearchQuery) {
      return files;
    }

    return files.filter((file) => file.file_name.toLowerCase().includes(normalizedSearchQuery));
  }, [files, normalizedSearchQuery]);

  const handleEditorModeChange = (mode: EditorModeEnum) => {
    setEditorMode(mode);
  };

  const fetchFolders = async () => {
    try {
      const loadedFolders = await invoke<IFolderInfo[]>('load_folders');
      setFolders(loadedFolders);

      return loadedFolders;
    } catch (error) {
      console.error('Error fetching folders:', error);

      return [];
    }
  };

  // The monotonic request id keeps an out-of-order response (delete a note, then
  // immediately switch folder) from applying a stale list.
  const fetchFiles = async (folderName: string) => {
    const requestId = filesRequestRef.current + 1;
    filesRequestRef.current = requestId;

    try {
      const loadedFiles = await invoke<IFileInfo[]>('load_files', { folderName });

      if (filesRequestRef.current === requestId) {
        setFiles(loadedFiles);
      }
    } catch (error) {
      console.error('Error fetching files:', error);

      if (filesRequestRef.current === requestId) {
        setFiles([]);
      }
    }
  };

  // Clearing the file selection in the same batched update as the folder change
  // is what stops autosave seeing a new folder with a stale file.
  const resetFolderSelection = (folderName: string | null) => {
    contentKeyRef.current = '';
    setSelectedFolder(folderName);
    setSelectedFile(null);
    setContent('');
    setFiles([]);
    setSearchQuery('');
  };

  const selectFolder = (folderName: string) => {
    // Without this, clicking the already-open folder would close the open note.
    if (folderName === selectedFolder) {
      return;
    }

    resetFolderSelection(folderName);
  };

  const selectFile = (fileName: string) => {
    setSelectedFile(fileName);
  };

  const addFolder = async (folderName: string) => {
    try {
      await invoke('add_folder', { folderName });
      await fetchFolders();
      selectFolder(folderName);
    } catch (error) {
      console.error('Error adding folder:', error);
      throw error;
    }
  };

  const renameFolder = async (oldFolderName: string, newFolderName: string) => {
    try {
      await invoke('rename_folder_by_name', { oldFolderName, newFolderName });
      await fetchFolders();

      if (selectedFolder === oldFolderName) {
        // Re-point rather than clear: a folder rename doesn't change the note's
        // bytes, so the live buffer stays valid and saves into the new path.
        contentKeyRef.current = buildContentKey(newFolderName, selectedFile);
        setSelectedFolder(newFolderName);
      }
    } catch (error) {
      console.error('Failed to rename folder:', error);
      throw error;
    }
  };

  const deleteFolder = async (folderName: string) => {
    try {
      await invoke('delete_folder_by_name', { folderName });
      const remainingFolders = await fetchFolders();

      if (selectedFolder === folderName) {
        resetFolderSelection(remainingFolders[0]?.folder_name ?? null);
      }
    } catch (error) {
      console.error('Failed to delete folder:', error);
    }
  };

  const addFile = async (fileName: string) => {
    if (!selectedFolder) {
      return;
    }

    try {
      await invoke('add_file', { folderName: selectedFolder, fileName });
      await fetchFiles(selectedFolder);
      await fetchFolders();
    } catch (error) {
      console.error('Error adding file:', error);
      throw error;
    }
  };

  const deleteFile = async (fileName: string) => {
    if (!selectedFolder) {
      return;
    }

    try {
      await invoke('delete_file_by_name', { folderName: selectedFolder, fileName });
      await fetchFiles(selectedFolder);
      await fetchFolders();

      // If the deleted file was the selected one, clear the content and selection
      if (selectedFile === fileName) {
        contentKeyRef.current = '';
        setSelectedFile(null);
        setContent('');
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  const renameFile = async (oldFileName: string, newFileName: string) => {
    if (!selectedFolder) {
      return;
    }

    try {
      await invoke('rename_file_by_name', {
        folderName: selectedFolder,
        oldFileName,
        newFileName,
      });
      await fetchFiles(selectedFolder);

      // Keep the open file selected under its new name
      if (selectedFile === oldFileName) {
        contentKeyRef.current = buildContentKey(selectedFolder, newFileName);
        setSelectedFile(newFileName);
      }
    } catch (error) {
      console.error('Failed to rename file:', error);
      throw error;
    }
  };

  useEffect(() => {
    const bootstrapFolders = async () => {
      const loadedFolders = await fetchFolders();

      setSelectedFolder((currentSelectedFolder) => {
        if (currentSelectedFolder) {
          return currentSelectedFolder;
        }

        const defaultFolder = loadedFolders.find((folder) => (
          folder.folder_name === DEFAULT_FOLDER_NAME
        ));

        return defaultFolder?.folder_name ?? loadedFolders[0]?.folder_name ?? null;
      });
    };

    bootstrapFolders();
  }, []);

  useEffect(() => {
    if (!selectedFolder) {
      setFiles([]);

      return;
    }

    fetchFiles(selectedFolder);
  }, [selectedFolder]);

  useEffect(() => {
    const contentKey = buildContentKey(selectedFolder, selectedFile);

    // An already-matching key means the buffer is current (a rename re-pointed
    // it); reloading would discard the last sub-debounce keystrokes.
    if (!contentKey || contentKey === contentKeyRef.current) {
      return;
    }

    let isCancelled = false;

    const fetchFileContent = async () => {
      try {
        const fileContent = await invoke<string>('load_content_by_name', {
          folderName: selectedFolder,
          fileName: selectedFile,
        });

        if (isCancelled) {
          return;
        }

        contentKeyRef.current = contentKey;
        setContent(fileContent);
      } catch (error) {
        console.error('Error fetching file content:', error);

        if (isCancelled) {
          return;
        }

        contentKeyRef.current = contentKey;
        setContent(''); // Default to empty string on error
      }
    };

    fetchFileContent();

    return () => {
      isCancelled = true;
    };
  }, [selectedFolder, selectedFile]);

  useEffect(() => {
    const contentKey = buildContentKey(selectedFolder, selectedFile);

    if (!contentKey) {
      console.warn('No folder or file selected. Content not saved.');

      return;
    }

    // The buffer still belongs to a different note than the one now selected.
    if (contentKey !== contentKeyRef.current) {
      return;
    }

    const saveContent = async () => {
      try {
        await invoke('save_content_by_name', {
          folderName: selectedFolder,
          fileName: selectedFile,
          content,
        });
      } catch (error) {
        console.error('Failed to save content:', error);
      }
    };

    // Debounce save to avoid too frequent writes
    const timeoutId = setTimeout(saveContent, SAVE_DEBOUNCE_DELAY);

    return () => clearTimeout(timeoutId);
  }, [selectedFolder, selectedFile, content]);

  const value: IAppContext = {
    content,
    setContent,
    editorMode,
    handleEditorModeChange,
    folders,
    selectedFolder,
    selectFolder,
    addFolder,
    renameFolder,
    deleteFolder,
    fetchFolders,
    files,
    filteredFiles,
    searchQuery,
    setSearchQuery,
    isSearching: Boolean(normalizedSearchQuery),
    selectFile,
    addFile,
    deleteFile,
    renameFile,
    selectedFile,
    fetchFiles,
  };

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
