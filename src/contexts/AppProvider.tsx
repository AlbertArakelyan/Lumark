import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from 'react';

interface IAppContext {
  content: string;
  setContent: Dispatch<SetStateAction<string>>;
}

export const AppContext = createContext<IAppContext>({} as IAppContext);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [content, setContent] = useState('');

  const value: IAppContext = {
    content,
    setContent,
  };

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

