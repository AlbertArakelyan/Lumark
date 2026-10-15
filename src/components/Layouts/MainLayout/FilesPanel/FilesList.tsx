import { useAppContext } from '../../../../contexts/AppProvider';
import FileItem from './FileItem';

const FilesList = () => {
  const { filteredFiles, isSearching, selectedFolder } = useAppContext();

  const filesContent = (
    filteredFiles.map((file) => (
      <FileItem key={file.file_name} file={file} />
    ))
  );

  const getEmptyMessage = () => {
    if (!selectedFolder) {
      return 'Select a folder to see its notes.';
    }

    return isSearching ? 'No files match your search.' : 'No files found.';
  };

  return (
    <div className="mt-1 flex flex-col gap-0.5">
      {filesContent.length > 0 ? filesContent : (
        <p className="px-2.5 py-6 text-sm text-center text-muted-text">{getEmptyMessage()}</p>
      )}
    </div>
  );
};

export default FilesList;
