import { ChangeEvent, FC, KeyboardEvent, useState } from 'react';
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

  const createdOn = new Date(epoch * 1000).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const deleteConfirmContent = `The note "${file.file_name}" will be deleted. This can't be undone.`;

  const handleFileClick = () => {
    if (isEditingName) {
      return;
    }

    selectFile(file.file_name);
  };

  const handleDeleteClick = () => setIsDeleteConfirmOpen(true);

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

  const handleEditClick = () => {
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
      setRenameError(typeof error === 'string' ? error : 'Could not rename the note');
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
      {isEditingName ? (
        <div className="flex flex-col gap-1 px-2 py-2 rounded-lg bg-gray-bg-hover">
          <div className="flex items-start gap-1">
            <Input
              autoFocus
              aria-label="Note name"
              value={fileName}
              error={renameError}
              onChange={handleFileNameChange}
              onKeyDown={handleFileNameKeyDown}
            />
            <Button
              variant="ghost"
              size="icon-md"
              className="!text-primary"
              icon={<CheckIcon size={16} />}
              aria-label="Save note name"
              title="Save"
              disabled={isSaveDisabled}
              onClick={handleSaveEdit}
            />
            <Button
              variant="ghost"
              size="icon-md"
              icon={<XIcon size={16} />}
              aria-label="Cancel renaming"
              title="Cancel"
              onClick={handleCancelEdit}
            />
          </div>
          <p className="font-mono text-xs tabular-nums text-muted-text">{createdOn}</p>
        </div>
      ) : (
        <div className={`group relative rounded-lg transition-colors duration-150 ${isSelected ? 'bg-gray-bg-active' : 'hover:bg-gray-bg-hover'}`}>
          <button
            type="button"
            className="w-full flex flex-col px-2 py-2 rounded-lg text-left cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-primary"
            aria-current={isSelected ? 'true' : undefined}
            title={file.file_name}
            onClick={handleFileClick}
          >
            <span className={`text-sm truncate ${isSelected ? 'font-medium text-primary' : ''}`}>{file.file_name}</span>
            <span className="font-mono text-xs tabular-nums text-muted-text">{createdOn}</span>
          </button>
          {/* The backing matches the row so the actions cover a long title instead of colliding with it.
              Besides hover, only keyboard focus reveals them: a mouse click focuses the row too and would pin them open. */}
          <div className={`absolute top-1/2 -translate-y-1/2 right-2 flex items-center gap-0.5 rounded-md opacity-0 group-hover:opacity-100 group-has-[:focus-visible]:opacity-100 transition-opacity duration-150 ${isSelected ? 'bg-gray-bg-active' : 'bg-gray-bg-hover'}`}>
            <Button
              variant="ghost"
              size="icon-sm"
              icon={<PencilIcon size={16} />}
              aria-label="Rename note"
              title="Rename"
              onClick={handleEditClick}
            />
            <Button
              variant="ghost-danger"
              size="icon-sm"
              icon={<Trash2Icon size={16} />}
              aria-label="Delete note"
              title="Delete"
              onClick={handleDeleteClick}
            />
          </div>
        </div>
      )}
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
