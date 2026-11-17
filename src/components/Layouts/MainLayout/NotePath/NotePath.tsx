import { useAppContext } from '../../../../contexts/AppProvider.tsx';

// Notes are plain .md files on disk, so the header names the open one the way a file path would.
const NotePath = () => {
  const { selectedFolder, selectedFile } = useAppContext();

  if (!selectedFolder) {
    return null;
  }

  const fullPath = selectedFile ? `${selectedFolder}/${selectedFile}.md` : selectedFolder;

  return (
    <p className="min-w-0 flex items-baseline font-mono text-xs text-muted-text" title={fullPath}>
      <span className="shrink-0 max-w-40 truncate">{selectedFolder}</span>
      {selectedFile && (
        <>
          <span className="shrink-0 px-1.5" aria-hidden="true">/</span>
          <span className="min-w-0 truncate text-text-color">{selectedFile}</span>
          <span className="shrink-0">.md</span>
        </>
      )}
    </p>
  );
};

export default NotePath;
