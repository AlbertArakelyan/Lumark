import { useAppContext } from '../../../../contexts/AppProvider';

const NotePath = () => {
  const { selectedFolder, selectedFile } = useAppContext();

  if (!selectedFolder || !selectedFile) {
    return null;
  }

  const notePath = `${selectedFolder}/${selectedFile}.md`;

  return (
    <p className="min-w-0 truncate text-sm" title={notePath}>
      <span className="text-muted-text">{selectedFolder}</span>
      <span className="mx-1.5 text-muted-text">/</span>
      <span className="font-medium">{selectedFile}</span>
      <span className="text-muted-text">.md</span>
    </p>
  );
};

export default NotePath;
