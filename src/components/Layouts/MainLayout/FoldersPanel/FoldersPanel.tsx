import FoldersHeader from './FoldersHeader';
import FoldersList from './FoldersList';

const FoldersPanel = () => (
  <div className="flex flex-col h-full min-h-0">
    <div className="shrink-0 p-2">
      <FoldersHeader />
    </div>
    <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-2">
      <FoldersList />
    </div>
  </div>
);

export default FoldersPanel;
