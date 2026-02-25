import { useState } from 'react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Save, Upload, ChevronDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type HostSessionSaveLoadProps = {
  sessionId: bigint;
  sessionName: string;
};

// NOTE: exportSession and importSession are not available in the current backend.
export default function HostSessionSaveLoad({ sessionId, sessionName }: HostSessionSaveLoadProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);

  const handleExport = async () => {
    toast.info('Session export is not available in the current version.');
  };

  const handleImportFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImportFile(file);
    setShowImportConfirm(true);
    e.target.value = '';
  };

  const handleImportConfirm = async () => {
    toast.info('Session import is not available in the current version.');
    setShowImportConfirm(false);
    setPendingImportFile(null);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isExporting || isImporting}>
            {isExporting || isImporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Session
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleExport} disabled={isExporting}>
            <Save className="mr-2 h-4 w-4" />
            Export Session
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <label className="flex items-center gap-2 cursor-pointer">
              <Upload className="h-4 w-4" />
              Import Session
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportFileSelect}
              />
            </label>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import Session</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace the current session data with the imported data. This action cannot
              be undone. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingImportFile(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleImportConfirm} disabled={isImporting}>
              {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
