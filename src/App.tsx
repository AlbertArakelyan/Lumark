import Editor from './components/Editor/Editor.tsx';
import MainLayout from './components/Layouts/MainLayout/MainLayout.tsx';

const App = () => (
  <div className="h-full bg-surface text-text-color">
    <MainLayout>
      <Editor />
    </MainLayout>
  </div>
);

export default App;
