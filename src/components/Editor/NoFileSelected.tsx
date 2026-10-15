import { FileTextIcon } from 'lucide-react';

const NoFileSelected = () => (
  <div className="h-full flex flex-col items-center justify-center gap-y-1 p-4 text-center">
    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-bg-active text-primary">
      <FileTextIcon size={22} />
    </div>
    <h2 className="text-lg font-semibold">No file is selected</h2>
    <p className="text-sm text-muted-text">Pick a note from the list, or create a new one to start writing.</p>
  </div>
);

export default NoFileSelected;
