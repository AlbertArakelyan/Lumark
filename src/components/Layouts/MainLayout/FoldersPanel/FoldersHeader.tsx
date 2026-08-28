import { ChangeEvent, KeyboardEvent, useState } from 'react';
import { BanIcon, CheckIcon, FolderPlusIcon } from 'lucide-react';
import Button from '../../../UI/Button/Button';
import Input from '../../../UI/Input/Input';
import { useAppContext } from '../../../../contexts/AppProvider';

const FoldersHeader = () => {
  const { addFolder } = useAppContext();

  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [addError, setAddError] = useState('');

  const trimmedFolderName = folderName.trim();

  const handleAddFolderClick = () => {
    setIsAddingFolder(true);
  };

  const handleCancelAddFolder = () => {
    setIsAddingFolder(false);
    setFolderName('');
    setAddError('');
  };

  const handleAddFolder = async () => {
    if (!trimmedFolderName) {
      return;
    }

    try {
      await addFolder(trimmedFolderName);
      setIsAddingFolder(false);
      setFolderName('');
      setAddError('');
    } catch (error) {
      setAddError(typeof error === 'string' ? error : 'Failed to add folder');
    }
  };

  const handleFolderNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFolderName(e.target.value);
    setAddError('');
  };

  const handleFolderNameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddFolder();
    }

    if (e.key === 'Escape') {
      handleCancelAddFolder();
    }
  };

  return (
    <>
      {isAddingFolder ? (
        <div className="flex flex-col items-start gap-1">
          <Input
            autoFocus
            key="folder-name-input"
            placeholder="Folder"
            inputElSize="xs"
            rounded="rounded"
            value={folderName}
            error={addError}
            onChange={handleFolderNameChange}
            onKeyDown={handleFolderNameKeyDown}
          />
          <div className={`flex items-center gap-0.5 w-full justify-end ${addError ? 'mt-4' : ''}`}>
            <Button
              variant="ghost"
              size="square-icon"
              className="text-success"
              icon={<CheckIcon size={16} />}
              aria-label="Save folder name"
              disabled={!trimmedFolderName}
              onClick={handleAddFolder}
            />
            <Button
              variant="ghost"
              size="square-icon"
              className="text-danger"
              icon={<BanIcon size={16} />}
              aria-label="Cancel adding folder"
              onClick={handleCancelAddFolder}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-1">
          <h2 className="text-sm text-muted-text truncate">Folders</h2>
          <Button
            className="!p-0.5"
            variant="ghost"
            size="square-icon"
            icon={<FolderPlusIcon size={18} />}
            aria-label="Add folder"
            onClick={handleAddFolderClick}
          />
        </div>
      )}
    </>
  );
};

export default FoldersHeader;
