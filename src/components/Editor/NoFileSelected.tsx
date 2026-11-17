import { FileTextIcon } from 'lucide-react';

const NoFileSelected = () => (
  <div className="h-full flex flex-col items-center justify-center p-6 text-center">
    <FileTextIcon size={20} className="mb-3 text-muted-text" />
    <h2 className="text-base font-medium">No note open</h2>
    <p className="mt-1 text-sm text-muted-text">Pick a note from the list, or start a new one</p>
  </div>
);

export default NoFileSelected;
