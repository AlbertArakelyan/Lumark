import { ChangeEvent, FC, KeyboardEvent, MouseEvent, useState } from 'react';
import { CheckIcon, FolderIcon, FolderOpenIcon, PencilIcon, Trash2Icon, XIcon } from 'lucide-react';
import { IFolderItemProps } from './types';
import { useAppContext } from '../../../../contexts/AppProvider';
import Button from '../../../UI/Button/Button';
import Input from '../../../UI/Input/Input';
import ConfirmModal from '../../../UI/ConfirmModal/ConfirmModal';

const FolderItem: FC<IFolderItemProps> = ({ folder }) => {
  const { selectFolder, selectedFolder, renameFolder, deleteFolder } = useAppContext();

  const [isEditingName, setIsEditingName] = useState(false);
  const [folderName, setFolderName] = useState(folder.folder_name);
  const [renameError, setRenameError] = useState('');
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isSelected = folder.folder_name === selectedFolder;
  const trimmedFolderName = folderName.trim();
  const isSaveDisabled = !trimmedFolderName || trimmedFolderName === folder.folder_name;

  const notesWarning = folder.note_count > 0
    ? ` The ${folder.note_count} note${folder.note_count === 1 ? '' : 's'} inside will be deleted too.`
    : '';
  const deleteConfirmContent = `Are you sure you want to delete the folder "${folder.folder_name}"?${notesWarning} This action cannot be undone.`;

  const handleFolderClick = () => {
    if (isEditingName) {
      return;
    }

    selectFolder(folder.folder_name);
  };

  const handleDeleteClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent the click event from bubbling up to the folder item

    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteCancel = () => setIsDeleteConfirmOpen(false);

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);

    try {
      await deleteFolder(folder.folder_name);
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  const handleEditClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent the click event from bubbling up to the folder item

    setFolderName(folder.folder_name);
    setRenameError('');
    setIsEditingName(true);
  };

  const handleCancelEdit = () => {
    setIsEditingName(false);
    setFolderName(folder.folder_name);
    setRenameError('');
  };

  const handleSaveEdit = async () => {
    if (isSaveDisabled) {
      return;
    }

    try {
      await renameFolder(folder.folder_name, trimmedFolderName);
      setIsEditingName(false);
      setRenameError('');
    } catch (error) {
      setRenameError(typeof error === 'string' ? error : 'Failed to rename folder');
    }
  };

  const handleFolderNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFolderName(e.target.value);
    setRenameError('');
  };

  const handleFolderNameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveEdit();
    }

    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  if (isEditingName) {
    return (
      <div className={`flex flex-col items-start gap-1 p-1.5 rounded-lg ${renameError ? 'pb-5' : ''}`}>
        <Input
          autoFocus
          inputElSize="xs"
          rounded="rounded"
          value={folderName}
          error={renameError}
          onChange={handleFolderNameChange}
          onKeyDown={handleFolderNameKeyDown}
        />
        <div className={`flex items-center gap-0.5 w-full justify-end ${renameError ? 'mt-4' : ''}`}>
          <Button
            variant="ghost"
            size="square-icon"
            className="!text-primary"
            icon={<CheckIcon size={14} />}
            aria-label="Save folder name"
            disabled={isSaveDisabled}
            onClick={handleSaveEdit}
          />
          <Button
            variant="ghost"
            size="square-icon"
            icon={<XIcon size={14} />}
            aria-label="Cancel renaming"
            onClick={handleCancelEdit}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`group relative flex items-center gap-1.5 px-2 py-1.5 cursor-pointer rounded-md transition-colors ${isSelected ? 'bg-gray-bg-active text-primary' : 'hover:bg-gray-bg-hover'}`}
        onClick={handleFolderClick}
      >
        {isSelected ? (
          <FolderOpenIcon size={14} className="shrink-0 fill-folder text-folder" />
        ) : (
          <FolderIcon size={14} className="shrink-0 fill-folder text-folder" />
        )}
        <span className={`text-sm truncate ${isSelected ? 'font-medium' : ''}`} title={folder.folder_name}>{folder.folder_name}</span>
        {/* The backing matches the row so the actions cover a long name instead of colliding with it. */}
        <div className={`absolute top-1/2 -translate-y-1/2 right-1 flex items-center rounded-md opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity ${isSelected ? 'bg-gray-bg-active' : 'bg-gray-bg-hover'}`}>
          <Button
            className="!p-0.5"
            variant="ghost"
            size="square-icon"
            icon={<PencilIcon size={12} />}
            aria-label="Rename folder"
            title="Rename"
            onClick={handleEditClick}
          />
          <Button
            className="!p-0.5"
            variant="ghost-danger"
            size="square-icon"
            icon={<Trash2Icon size={12} />}
            aria-label="Delete folder"
            title="Delete"
            onClick={handleDeleteClick}
          />
        </div>
      </div>
      <ConfirmModal
        isOpen={isDeleteConfirmOpen}
        title="Delete folder"
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

export default FolderItem;
