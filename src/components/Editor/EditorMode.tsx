import React from 'react';
import { useAppContext } from '../../contexts/AppProvider.tsx';
import { EditorModeEnum } from '../../types/editor/editorEnums.ts';
import { EyeIcon, PencilIcon, SplitSquareHorizontal } from 'lucide-react';

const editorModeButtons: {
  label: string;
  value: EditorModeEnum;
  icon: React.ReactNode;
}[] = [
  { label: 'Split', value: EditorModeEnum.SPLIT, icon: <SplitSquareHorizontal className="w-4 h-4" /> },
  { label: 'Edit', value: EditorModeEnum.EDIT, icon: <PencilIcon className="w-4 h-4" /> },
  { label: 'Preview', value: EditorModeEnum.PREVIEW, icon: <EyeIcon className="w-4 h-4" /> },
];

const EditorMode = () => {
  const { editorMode, handleEditorModeChange, selectedFile } = useAppContext();

  // Without a selected file there is no editor to switch modes on
  const isDisabled = !selectedFile;

  const buttonsContent = editorModeButtons.map((button) => {
    const stateClassName = button.value === editorMode ? 'bg-gray-300' : (isDisabled ? '' : 'hover:bg-gray-200');
    const interactionClassName = isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:cursor-pointer';

    return (
      <button
        key={button.value}
        disabled={isDisabled}
        onClick={() => handleEditorModeChange(button.value)}
        className={`${stateClassName} ${interactionClassName} inline-flex items-center p-1 border border-gray-300 text-sm font-medium rounded-md focus:outline-none transition-colors`}
      >
        {button.icon}
      </button>
    );
  });

  return (
    <div className="flex w-max items-center gap-1">
      {buttonsContent}
    </div>
  );
};

export default EditorMode;
