import { useAppContext } from '../../../../contexts/AppProvider';
import FolderItem from './FolderItem';

const FoldersList = () => {
  const { folders } = useAppContext();

  const foldersContent = (
    folders.map((folder) => (
      <FolderItem key={folder.folder_name} folder={folder} />
    ))
  );

  return (
    <div className="mt-1 flex flex-col gap-0.5">
      {foldersContent.length > 0 ? foldersContent : <p className="px-2 py-4 text-xs text-muted-text">No folders yet.</p>}
    </div>
  );
};

export default FoldersList;
