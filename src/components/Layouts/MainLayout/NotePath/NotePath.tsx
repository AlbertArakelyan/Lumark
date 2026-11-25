import { useAppContext } from '../../../../contexts/AppProvider';

const NotePath = () => {
  const { selectedFolder, selectedFile } = useAppContext();

  if (!selectedFolder || !selectedFile) {
    return null;
  }

  const notePath = `${selectedFolder}/${selectedFile}.md`;

  return (
    <p className="min-w-0 truncate text-sm" title={notePath}>
      <span className="text-muted-text">{selectedFolder}/</span>
      <span className="font-medium">{selectedFile}.md</span>
    </p>
  );
};

export default NotePath;
