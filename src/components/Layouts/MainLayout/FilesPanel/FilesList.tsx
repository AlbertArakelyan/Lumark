import { useAppContext } from '../../../../contexts/AppProvider';
import FileItem from './FileItem';

const FilesList = () => {
  const { files } = useAppContext();

  const filesContent = (
    files.map((file) => (
      <FileItem key={file.file_name} file={file} />
    ))
  );

  return (
    <div className="mt-1">
      {filesContent.length > 0 ? filesContent : <div>No files found.</div>}
    </div>
  );
};

export default FilesList;
