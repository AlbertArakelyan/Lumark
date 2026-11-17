import { ChangeEvent, FC, KeyboardEvent, useState } from 'react';
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
  const deleteConfirmContent = `The folder "${folder.folder_name}" will be deleted.${notesWarning} This can't be undone.`;

  const handleFolderClick = () => {
    if (isEditingName) {
      return;
    }

    selectFolder(folder.folder_name);
  };

  const handleDeleteClick = () => setIsDeleteConfirmOpen(true);

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

  const handleEditClick = () => {
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
      <div className="flex flex-col items-start gap-1 py-1">
        <Input
          autoFocus
          inputElSize="xs"
          rounded="sm"
          value={folderName}
          error={renameError}
          onChange={handleFolderNameChange}
          onKeyDown={handleFolderNameKeyDown}
        />
        <div className="flex items-center gap-0.5 w-full justify-end">
          <Button
            variant="ghost"
            size="icon-xs"
            className="!text-primary"
            icon={<CheckIcon size={14} />}
            aria-label="Save folder name"
            title="Save"
            disabled={isSaveDisabled}
            onClick={handleSaveEdit}
          />
          <Button
            variant="ghost"
            size="icon-xs"
            icon={<XIcon size={14} />}
            aria-label="Cancel renaming"
            title="Cancel"
            onClick={handleCancelEdit}
          />
        </div>
      </div>
    );
  }

  // Gold marks the open folder only; on every row it would stop meaning anything.
  const folderIcon = isSelected
    ? <FolderOpenIcon size={16} className="shrink-0 fill-folder text-folder" />
    : <FolderIcon size={16} className="shrink-0 text-muted-text" />;

  return (
    <>
      <div className={`group relative rounded-lg transition-colors duration-150 ${isSelected ? 'bg-gray-bg-active' : 'hover:bg-gray-bg-hover'}`}>
        <button
          type="button"
          className="w-full h-8 flex items-center gap-1.5 px-2 rounded-lg text-left cursor-pointer outline-none focus-visible:outline-2 focus-visible:outline-primary"
          aria-current={isSelected ? 'true' : undefined}
          title={folder.folder_name}
          onClick={handleFolderClick}
        >
          {folderIcon}
          <span className={`min-w-0 flex-1 truncate text-sm ${isSelected ? 'font-medium text-primary' : ''}`}>{folder.folder_name}</span>
          <span className="shrink-0 font-mono text-xs tabular-nums text-muted-text">
            {folder.note_count}
          </span>
        </button>
        {/* The backing matches the row so the actions cover a long name instead of colliding with it.
            Besides hover, only keyboard focus reveals them: a mouse click focuses the row too and would pin them open. */}
        <div className={`absolute top-1/2 -translate-y-1/2 right-1 flex items-center gap-0.5 rounded-md opacity-0 group-hover:opacity-100 group-has-[:focus-visible]:opacity-100 transition-opacity duration-150 ${isSelected ? 'bg-gray-bg-active' : 'bg-gray-bg-hover'}`}>
          <Button
            variant="ghost"
            size="icon-xs"
            icon={<PencilIcon size={14} />}
            aria-label="Rename folder"
            title="Rename"
            onClick={handleEditClick}
          />
          <Button
            variant="ghost-danger"
            size="icon-xs"
            icon={<Trash2Icon size={14} />}
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
