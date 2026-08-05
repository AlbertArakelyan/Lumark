import { FC, PropsWithChildren } from 'react';
import FilesPanel from './FilesPanel/FilesPanel';
import EditorMode from '../../Editor/EditorMode';

const MainLayout: FC<PropsWithChildren> = ({ children }) => (
  <div className="flex flex-col h-screen">
    <header className="h-9 border-b border-border-color flex items-center justify-end px-4">
      <EditorMode />
    </header>
    <div className="flex flex-1 overflow-hidden">
      <aside className="max-w-64 w-full p-2 border-r border-border-color overflow-y-auto">
        <FilesPanel />
      </aside>
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  </div>
);

export default MainLayout;
