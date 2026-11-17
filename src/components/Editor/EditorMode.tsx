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
  { label: 'Split', value: EditorModeEnum.SPLIT, icon: <SplitSquareHorizontal size={16} /> },
  { label: 'Edit', value: EditorModeEnum.EDIT, icon: <PencilIcon size={16} /> },
  { label: 'Preview', value: EditorModeEnum.PREVIEW, icon: <EyeIcon size={16} /> },
];

const EditorMode = () => {
  const { editorMode, handleEditorModeChange, selectedFile } = useAppContext();

  // Without a selected file there is no editor to switch modes on
  const isDisabled = !selectedFile;

  const buttonsContent = editorModeButtons.map((button) => (
    <ToolbarButton
      key={button.value}
      size="sm"
      isActive={button.value === editorMode}
      disabled={isDisabled}
      onClick={() => handleEditorModeChange(button.value)}
      title={button.label}
      aria-label={button.label}
    >
      {button.icon}
    </ToolbarButton>
  ));

  // 24px buttons plus 2px padding make the group 28px, the same height as the toolbar buttons beside it.
  return (
    <div className="flex w-max items-center gap-0.5 p-0.5 bg-gray-bg rounded-lg" role="group" aria-label="Editor mode">
      {buttonsContent}
    </div>
  );
};

export default EditorMode;
