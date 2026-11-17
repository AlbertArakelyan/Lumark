import { ChangeEvent, KeyboardEvent, useState } from 'react';
import { SearchIcon, SquarePenIcon, XIcon } from 'lucide-react';
import Button from '../../../UI/Button/Button';
import Input from '../../../UI/Input/Input';
import { useAppContext } from '../../../../contexts/AppProvider';

const FilesSearch = () => {
  const { addFile, selectedFolder, searchQuery, setSearchQuery } = useAppContext();

  const [isAddingFile, setIsAddingFile] = useState(false);
  const [fileName, setFileName] = useState('');
  const [addError, setAddError] = useState('');

  const trimmedFileName = fileName.trim();

  const handleAddFileClick = () => {
    setIsAddingFile(true);
  };

  const handleCancelAddFile = () => {
    setIsAddingFile(false);
    setFileName('');
    setAddError('');
  };

  const handleAddFile = async () => {
    if (!trimmedFileName) {
      return;
    }

    try {
      await addFile(trimmedFileName);

      setIsAddingFile(false);
      setFileName('');
      setAddError('');
      // Clear the search so the freshly added file is visible in the list
      setSearchQuery('');
    } catch (error) {
      setAddError(typeof error === 'string' ? error : 'Could not add the note');
    }
  };

  const handleFileNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFileName(e.target.value);
    setAddError('');
  };

  const handleFileNameKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleAddFile();
    }

    if (e.key === 'Escape') {
      handleCancelAddFile();
    }
  };

  const handleSearchQueryChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClearSearch();
    }
  };

  return (
    <>
      {isAddingFile ? (
        <div className="flex flex-col items-start gap-2">
          <Input
            autoFocus
            key="file-name-input"
            placeholder="Note name"
            value={fileName}
            error={addError}
            onChange={handleFileNameChange}
            onKeyDown={handleFileNameKeyDown}
          />
          <div className="flex items-center gap-2 w-full justify-end">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancelAddFile}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={handleAddFile}
              disabled={!trimmedFileName}
            >
              Add note
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            key="file-search-input"
            placeholder="Search"
            aria-label="Search notes"
            disabled={!selectedFolder}
            icon={searchQuery ? (
              <Button
                variant="ghost"
                size="icon-xs"
                rounded="sm"
                icon={<XIcon size={14} />}
                aria-label="Clear search"
                onClick={handleClearSearch}
              />
            ) : (
              <SearchIcon size={14} />
            )}
            value={searchQuery}
            onChange={handleSearchQueryChange}
            onKeyDown={handleSearchKeyDown}
          />
          <Button
            variant="outline"
            size="icon-md"
            rounded="lg"
            icon={<SquarePenIcon size={16} />}
            aria-label="New note"
            title="New note"
            disabled={!selectedFolder}
            onClick={handleAddFileClick}
          />
        </div>
      )}
    </>
  );
};

export default FilesSearch;
