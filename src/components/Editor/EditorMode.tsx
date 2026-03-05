import React from 'react';
import { useAppContext } from '../../contexts/AppProvider.tsx';
import { EditorModeEnum } from '../../types/editor/editorEnums.ts';
import { EyeIcon, PencilIcon, SplitSquareHorizontal, ChevronDown } from 'lucide-react';

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
      className={`${button.value === editorMode ? 'bg-gray-300' : ''} inline-flex items-center p-1 border border-gray-300 text-sm font-medium rounded-md focus:outline-none hover:cursor-pointer`}
    >
      {button.icon}
    </button>
  ));

  return (
    <div className="flex items-center justify-start flex-col fixed top-0 left-1/2 -translate-x-1/2 z-10 group">
      <div className="w-max items-center gap-1 bg-white py-1 group-hover:flex hidden">
        {buttonsContent}
      </div>
      <button
        className="py-1 px-2 hover:bg-gray-100 hover:text-gray-900 focus:outline-none hover:cursor-pointer rounded-b-lg group-hover:bg-gray-100"
      >
        <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
      </button>
    </div>
  );
};

export default EditorMode;
