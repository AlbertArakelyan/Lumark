import { ChangeEvent, FC, KeyboardEvent, MouseEvent, useState } from 'react';
import { BanIcon, CheckIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { IFileItemProps } from './types';
import { useAppContext } from '../../../../contexts/AppProvider';
import Button from '../../../UI/Button/Button';
import Input from '../../../UI/Input/Input';

const FileItem: FC<IFileItemProps> = ({ file }) => {
  const { selectFile, selectedFile, deleteFile, renameFile } = useAppContext();

  const [isEditingName, setIsEditingName] = useState(false);
  const [fileName, setFileName] = useState(file.file_name);
  const [renameError, setRenameError] = useState('');

  const epoch = Number(file.date_created);
  const trimmedFileName = fileName.trim();
  const isSaveDisabled = !trimmedFileName || trimmedFileName === file.file_name;

  const handleFileClick = () => {
    if (isEditingName) {
      return;
    }

    selectFile(file.file_name);
  };

  const handleDeleteClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent the click event from bubbling up to the file item

    // TODO: Replace the window.confirm with a custom modal for better UX
    const shouldDelete = window.confirm(`Are you sure you want to delete the file "${file.file_name}"? This action cannot be undone.`);

    if (!shouldDelete) {
      return;
    }

    deleteFile(file.file_name);
  };

  const handleEditClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent the click event from bubbling up to the file item

    setFileName(file.file_name);
    setRenameError('');
    setIsEditingName(true);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setFileName(file.file_name);
    setRenameError('');
  };

  const handleSaveEdit = async () => {
    if (isSaveDisabled) {
      return;
    }

    try {
      await renameFile(file.file_name, trimmedFileName);
      setIsEditingName(false);
      setRenameError('');
    } catch (error) {
      setRenameError(typeof error === 'string' ? error : 'Failed to rename file');
    }
  };

  const handleFileNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFileName(e.target.value);
    setRenameError('');
  };

  const handleFileNameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    }

    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div
      key={file.file_name}
      className={`group flex flex-col gap-y-0.5 p-2 hover:bg-gray-bg-hover cursor-pointer rounded-xl relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-border-color/50 after:content-[''] ${file.file_name === selectedFile ? 'bg-gray-bg-active' : ''}`}
      onClick={handleFileClick}
    >
      {isEditingName ? (
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <Input
            autoFocus
            rounded="rounded"
            value={fileName}
            error={renameError}
            onChange={handleFileNameChange}
            onKeyDown={handleFileNameKeyDown}
          />
          <Button
            variant="ghost"
            size="square-icon"
            className="text-success"
            icon={<CheckIcon size={20} />}
            aria-label="Save file name"
            disabled={isSaveDisabled}
            onClick={handleSaveEdit}
          />
          <Button
            variant="ghost"
            size="square-icon"
            className="text-danger"
            icon={<BanIcon size={20} />}
            aria-label="Cancel renaming"
            onClick={handleCancelEdit}
          />
        </div>
      ) : (
        <h3 className="font-medium truncate pr-7">{file.file_name}</h3>
      )}
      <p className={`text-sm text-muted-text pr-7 ${renameError ? 'mt-4' : ''}`}>
        Created: <span>{new Date(epoch * 1000).toLocaleDateString()}</span>
      </p>
      {!isEditingName && (
        <div className="absolute top-1/2 -translate-y-1/2 right-2 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            className="!p-0.5"
            variant="ghost"
            size="square-icon"
            icon={<PencilIcon size={14} />}
            aria-label="Rename file"
            onClick={handleEditClick}
          />
          <Button
            className="!p-0.5"
            variant="ghost"
            size="square-icon"
            icon={<Trash2Icon size={14} />}
            aria-label="Delete file"
            onClick={handleDeleteClick}
          />
        </div>
      )}
    </div>
  );
};

export default FileItem;
