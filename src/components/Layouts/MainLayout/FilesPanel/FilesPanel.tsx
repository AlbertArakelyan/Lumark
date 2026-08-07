import FilesSearch from './FilesSearch';
import FilesList from './FilesList';

const FilesPanel = () => (
  <div className="flex flex-col h-full min-h-0">
    <div className="shrink-0 p-2">
      <FilesSearch />
    </div>
    <div className="flex-1 min-h-0 overflow-y-auto px-2 pb-2">
      <FilesList />
    </div>
  </div>
);

export default FilesPanel;
