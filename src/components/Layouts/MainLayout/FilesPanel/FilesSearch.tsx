import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { SearchIcon, SquarePenIcon, XIcon } from 'lucide-react';
import Button from '../../../UI/Button/Button';
import Input from '../../../UI/Input/Input';
import { useAppContext } from '../../../../contexts/AppProvider';

const FilesSearch = () => {
  const { fetchFiles, searchQuery, setSearchQuery } = useAppContext();

  const [isAddingFile, setIsAddingFile] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleAddFileClick = () => {
    setIsAddingFile(true);
  };

  const handleCancelAddFile = () => {
    setIsAddingFile(false);
    setFileName('');
  };

  const handleAddFile = async () => {
    try {
      if (!fileName.trim()) {
        return;
      }

      await invoke('add_file', { fileName: fileName.trim() });
      await fetchFiles();

      setIsAddingFile(false);
      setFileName('');
      // Clear the search so the freshly added file is visible in the list
      setSearchQuery('');
    } catch (error) {
      console.error('Error adding file:', error);
    }
  };

  const handleFileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(e.target.value);
  };

  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClearSearch();
    }
  };

  return (
    <>
      {isAddingFile ? (
        <div className="flex flex-col items-start gap-2">
          <Input
            key="file-name-input"
            placeholder="File name"
            rounded="rounded"
            value={fileName}
            onChange={handleFileNameChange}
          />
          <div className="flex items-center gap-1 w-full justify-end">
            <Button
              size="sm"
              variant="success"
              onClick={handleAddFile}
              disabled={!fileName.trim()}
            >
            Add
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={handleCancelAddFile}
            >
            Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-1">
          <Input
            key="file-search-input"
            placeholder="Search"
            rounded="rounded"
            icon={searchQuery ? (
              <Button
                variant="ghost"
                size="square-icon"
                rounded="circle"
                className="!p-0.5"
                icon={<XIcon size={16} />}
                aria-label="Clear search"
                onClick={handleClearSearch}
              />
            ) : (
              <SearchIcon size={16} className="text-muted-text" />
            )}
            value={searchQuery}
            onChange={handleSearchQueryChange}
            onKeyDown={handleSearchKeyDown}
          />
          <Button
            variant="ghost"
            size="square-icon"
            icon={<SquarePenIcon />}
            onClick={handleAddFileClick}
          />
        </div>
      )}
    </>
  );
};

export default FilesSearch;
