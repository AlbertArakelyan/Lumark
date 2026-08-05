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
  const { editorMode, handleEditorModeChange } = useAppContext();

  const buttonsContent = editorModeButtons.map((button) => (
    <button
      key={button.value}
      onClick={() => handleEditorModeChange(button.value)}
      className={`${button.value === editorMode ? 'bg-gray-300' : 'hover:bg-gray-200'} inline-flex items-center p-1 border border-gray-300 text-sm font-medium rounded-md focus:outline-none hover:cursor-pointer transition-colors`}
    >
      {button.icon}
    </button>
  ));

  return (
    <div className="flex w-max items-center gap-1">
      {buttonsContent}
    </div>
  );
};

export default EditorMode;
