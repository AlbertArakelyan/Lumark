import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface IAppContext {
  content: string;
  setContent: Dispatch<SetStateAction<string>>;
}

export const AppContext = createContext<IAppContext>({} as IAppContext);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState('');

  useEffect(() => {
    const loadContent = async () => {
      try {
        const savedContent = await invoke<string>('load_content');
        setContent(savedContent);
      } catch (error) {
        console.error('Failed to load content:', error);
        setContent(''); // Default to empty string on error
      }
    };

    loadContent();
  }, []);

  // Auto-save content when it changes
  useEffect(() => {
    const saveContent = async () => {
      try {
        await invoke('save_content', { content });
      } catch (error) {
        console.error('Failed to save content:', error);
      }
    };

    // Debounce save to avoid too frequent writes
    const timeoutId = setTimeout(saveContent, 500);
    return () => clearTimeout(timeoutId);
  }, [content]);

  const value: IAppContext = {
    content,
    setContent,
  };

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

