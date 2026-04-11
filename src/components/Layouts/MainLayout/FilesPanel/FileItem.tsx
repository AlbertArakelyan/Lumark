import { FC } from 'react';
import { Trash2Icon } from 'lucide-react';
import { IFileItemProps } from './types';
import { useAppContext } from '../../../../contexts/AppProvider';
import Button from '../../../UI/Button/Button';

const FileItem: FC<IFileItemProps> = ({ file }) => {
  const { selectFile, selectedFile, deleteFile } = useAppContext();

  const epoch = Number(file.date_created);

  const handleFileClick = (fileName: string) => {
    console.log(`File clicked: ${fileName}`);
    selectFile(fileName);
  };

  const handleDeleteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent the click event from bubbling up to the file item

    // TODO: Replace the window.confirm with a custom modal for better UX
    const shouldDelete = window.confirm(`Are you sure you want to delete the file "${file.file_name}"? This action cannot be undone.`);

    if (!shouldDelete) {
      return;
    }

    console.log(`Delete clicked for file: ${file.file_name}`);
    // Call the delete function from context here, e.g., deleteFile(file.file_name);
    deleteFile(file.file_name);
  };

  return (
    <div
      key={file.file_name}
      className={`group flex flex-col gap-y-0.5 p-2 hover:bg-gray-bg-hover cursor-pointer rounded-xl relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-border-color/50 after:content-[''] ${file.file_name === selectedFile ? 'bg-gray-bg-active' : ''}`}
      onClick={() => handleFileClick(file.file_name)}
    >
      <h3 className="font-medium">{file.file_name}</h3>
      <p className="text-sm text-muted-text">
        Created: <span>{new Date(epoch * 1000).toLocaleDateString()}</span>
      </p>
      <Button
        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        variant="ghost"
        size="square-icon"
        icon={<Trash2Icon size={20} />}
        onClick={handleDeleteClick}
      />
    </div>
  );
};

export default FileItem;
