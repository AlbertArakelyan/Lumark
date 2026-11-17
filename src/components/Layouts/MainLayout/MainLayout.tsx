import { FC, PropsWithChildren, useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import FoldersPanel from './FoldersPanel/FoldersPanel';
import FilesPanel from './FilesPanel/FilesPanel';
import NotePath from './NotePath/NotePath';
import EditorMode from '../../Editor/EditorMode';
import ToolbarButton from '../../UI/ToolbarButton/ToolbarButton';
import ThemeToggle from './ThemeToggle/ThemeToggle';

const MainLayout: FC<PropsWithChildren> = ({ children }) => {
  const [areSidePanelsCollapsed, setAreSidePanelsCollapsed] = useState(false);

  const sidePanelsVisibilityClassName = areSidePanelsCollapsed ? 'hidden' : '';
  const sidePanelsToggleLabel = areSidePanelsCollapsed ? 'Show side panels' : 'Hide side panels';

  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <header className="h-10 shrink-0 border-b border-border-color flex items-center gap-3 px-2">
        <ToolbarButton
          isActive={areSidePanelsCollapsed}
          onClick={() => setAreSidePanelsCollapsed((previousValue) => !previousValue)}
          title={sidePanelsToggleLabel}
          aria-label={sidePanelsToggleLabel}
        >
          {areSidePanelsCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </ToolbarButton>
        <NotePath />
        <div className="ml-auto flex items-center gap-2">
          <EditorMode />
          <span className="h-4 w-px bg-border-color" aria-hidden="true" />
          <ThemeToggle />
        </div>
      </header>
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <aside className={`w-32 shrink-0 min-h-0 border-r border-border-color ${sidePanelsVisibilityClassName}`}>
          <FoldersPanel />
        </aside>
        <aside className={`w-64 shrink-0 min-h-0 border-r border-border-color ${sidePanelsVisibilityClassName}`}>
          <FilesPanel />
        </aside>
        <main className="flex-1 min-w-0 min-h-0 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
