import { FC, PropsWithChildren } from 'react';
import FoldersPanel from './FoldersPanel/FoldersPanel';
import FilesPanel from './FilesPanel/FilesPanel';
import EditorMode from '../../Editor/EditorMode';

const MainLayout: FC<PropsWithChildren> = ({ children }) => (
  <div className="flex flex-col h-dvh overflow-hidden">
    <header className="h-9 shrink-0 border-b border-border-color flex items-center justify-end px-4">
      <EditorMode />
    </header>
    <div className="flex flex-1 min-h-0 overflow-hidden">
      <aside className="w-32 shrink-0 min-h-0 border-r border-border-color">
        <FoldersPanel />
      </aside>
      <aside className="w-64 shrink-0 min-h-0 border-r border-border-color">
        <FilesPanel />
      </aside>
      <main className="flex-1 min-w-0 min-h-0 overflow-auto">
        {children}
      </main>
    </div>
  </div>
);

export default MainLayout;
