import { FC, PropsWithChildren, useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import FoldersPanel from './FoldersPanel/FoldersPanel';
import FilesPanel from './FilesPanel/FilesPanel';
import EditorMode from '../../Editor/EditorMode';
import ToolbarButton from '../../UI/ToolbarButton/ToolbarButton';

const MainLayout: FC<PropsWithChildren> = ({ children }) => {
  const [areSidePanelsCollapsed, setAreSidePanelsCollapsed] = useState(false);

  const sidePanelsVisibilityClassName = areSidePanelsCollapsed ? 'hidden' : '';
  const sidePanelsToggleLabel = areSidePanelsCollapsed ? 'Show side panels' : 'Hide side panels';

  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <header className="h-9 shrink-0 border-b border-border-color flex items-center justify-between px-4">
        <ToolbarButton
          isActive={areSidePanelsCollapsed}
          onClick={() => setAreSidePanelsCollapsed((previousValue) => !previousValue)}
          title={sidePanelsToggleLabel}
          aria-label={sidePanelsToggleLabel}
        >
          {areSidePanelsCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </ToolbarButton>
        <EditorMode />
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
