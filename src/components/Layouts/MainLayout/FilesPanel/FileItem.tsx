import { ChangeEvent, FC, KeyboardEvent, MouseEvent, useState } from 'react';
import { CheckIcon, PencilIcon, Trash2Icon, XIcon } from 'lucide-react';
import { IFileItemProps } from './types';
import { useAppContext } from '../../../../contexts/AppProvider';
import Button from '../../../UI/Button/Button';
import Input from '../../../UI/Input/Input';
import ConfirmModal from '../../../UI/ConfirmModal/ConfirmModal';

const FileItem: FC<IFileItemProps> = ({ file }) => {
  const { selectFile, selectedFile, deleteFile, renameFile } = useAppContext();

  const [isEditingName, setIsEditingName] = useState(false);
  const [fileName, setFileName] = useState(file.file_name);
  const [renameError, setRenameError] = useState('');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isSelected = file.file_name === selectedFile;
  const epoch = Number(file.date_created);
  const trimmedFileName = fileName.trim();
  const isSaveDisabled = !trimmedFileName || trimmedFileName === file.file_name;

  const deleteConfirmContent = `Are you sure you want to delete the file "${file.file_name}"? This action cannot be undone.`;

  const handleFileClick = () => {
    if (isEditingName) {
      return;
    }

    selectFile(file.file_name);
  };

  const handleDeleteClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent the click event from bubbling up to the file item

    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteCancel = () => setIsDeleteConfirmOpen(false);

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);

    try {
      await deleteFile(file.file_name);
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
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
    <>
      <div
        key={file.file_name}
        className={`group relative flex flex-col gap-y-0.5 px-2.5 py-2 cursor-pointer rounded-lg transition-colors ${isSelected ? 'bg-gray-bg-active' : 'hover:bg-gray-bg-hover'}`}
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
              className="!text-primary"
              icon={<CheckIcon size={16} />}
              aria-label="Save file name"
              disabled={isSaveDisabled}
              onClick={handleSaveEdit}
            />
            <Button
              variant="ghost"
              size="square-icon"
              icon={<XIcon size={16} />}
              aria-label="Cancel renaming"
              onClick={handleCancelEdit}
            />
          </div>
        ) : (
          <h3 className={`text-sm font-medium truncate ${isSelected ? 'text-primary' : ''}`} title={file.file_name}>{file.file_name}</h3>
        )}
        <p className={`text-xs text-muted-text ${renameError ? 'mt-4' : ''}`}>
          {new Date(epoch * 1000).toLocaleDateString()}
        </p>
        {!isEditingName && (
          // The backing matches the row so the actions cover a long title instead of colliding with it.
          <div className={`absolute top-1/2 -translate-y-1/2 right-1.5 flex items-center gap-0.5 p-0.5 rounded-md opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity ${isSelected ? 'bg-gray-bg-active' : 'bg-gray-bg-hover'}`}>
            <Button
              variant="ghost"
              size="square-icon"
              icon={<PencilIcon size={14} />}
              aria-label="Rename file"
              title="Rename"
              onClick={handleEditClick}
            />
            <Button
              variant="ghost-danger"
              size="square-icon"
              icon={<Trash2Icon size={14} />}
              aria-label="Delete file"
              title="Delete"
              onClick={handleDeleteClick}
            />
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        title="Delete note"
        content={deleteConfirmContent}
        confirmText="Delete"
        confirmVariant="danger"
        isConfirming={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </>
  );
};

export default FileItem;
