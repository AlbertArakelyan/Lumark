import { useAppContext } from '../../../../contexts/AppProvider';
import FileItem from './FileItem';

const FilesList = () => {
  const { filteredFiles, isSearching } = useAppContext();

  const filesContent = (
    filteredFiles.map((file) => (
      <FileItem key={file.file_name} file={file} />
    ))
  );

  const emptyMessage = isSearching ? 'No files match your search.' : 'No files found.';

  return (
    <div className="mt-1">
      {filesContent.length > 0 ? filesContent : <div>{emptyMessage}</div>}
    </div>
  );
};

export default FilesList;
