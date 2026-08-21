import Editor from './components/Editor/Editor.tsx';
import NoFileSelected from './components/Editor/NoFileSelected.tsx';
import MainLayout from './components/Layouts/MainLayout/MainLayout.tsx';
import { useAppContext } from './contexts/AppProvider.tsx';

const App = () => {
  const { selectedFile } = useAppContext();

  return (
    <div className="h-full bg-surface text-text-color">
      <MainLayout>
        {selectedFile ? <Editor /> : <NoFileSelected />}
      </MainLayout>
    </div>
  );
};

export default App;
