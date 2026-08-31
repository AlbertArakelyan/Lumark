import { ReactNode } from 'react';
import { useAppContext } from '../../contexts/AppProvider.tsx';
import { EditorModeEnum } from '../../types/editor/editorEnums.ts';
import { EyeIcon, PencilIcon, SplitSquareHorizontal } from 'lucide-react';
import ToolbarButton from '../UI/ToolbarButton/ToolbarButton.tsx';

const editorModeButtons: {
  label: string;
  value: EditorModeEnum;
  icon: ReactNode;
}[] = [
  { label: 'Split', value: EditorModeEnum.SPLIT, icon: <SplitSquareHorizontal className="w-4 h-4" /> },
  { label: 'Edit', value: EditorModeEnum.EDIT, icon: <PencilIcon className="w-4 h-4" /> },
  { label: 'Preview', value: EditorModeEnum.PREVIEW, icon: <EyeIcon className="w-4 h-4" /> },
];

const EditorMode = () => {
  const { editorMode, handleEditorModeChange, selectedFile } = useAppContext();

  // Without a selected file there is no editor to switch modes on
  const isDisabled = !selectedFile;

  const buttonsContent = editorModeButtons.map((button) => (
    <ToolbarButton
      key={button.value}
      isActive={button.value === editorMode}
      disabled={isDisabled}
      onClick={() => handleEditorModeChange(button.value)}
      title={button.label}
      aria-label={button.label}
    >
      {button.icon}
    </ToolbarButton>
  ));

  return (
    <div className="flex w-max items-center gap-1">
      {buttonsContent}
    </div>
  );
};

export default EditorMode;
