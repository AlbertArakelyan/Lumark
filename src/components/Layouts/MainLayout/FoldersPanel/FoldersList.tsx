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
    <div className="mt-1">
      {foldersContent.length > 0 ? foldersContent : <div className="text-sm text-muted-text">No folders found.</div>}
    </div>
  );
};

export default FoldersList;
