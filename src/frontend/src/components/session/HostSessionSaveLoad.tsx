import { useState } from 'react';
import { useActor } from '../../hooks/useActor';
import { downloadExportFile, parseImportFile } from '../../lib/sessionExportFile';
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
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, Save, Upload, MoreVertical } from 'lucide-react';

type HostSessionSaveLoadProps = {
  sessionId: bigint;
  sessionName: string;
};

export default function HostSessionSaveLoad({ sessionId, sessionName }: HostSessionSaveLoadProps) {
  const { actor } = useActor();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmImport, setConfirmImport] = useState(false);
  const [importData, setImportData] = useState<any>(null);

  const handleExport = async () => {
    if (!actor) return;

    setSaving(true);
    setError('');

    try {
      const exportData = await actor.exportSession(sessionId);
      
      if (!exportData) {
        throw new Error('Failed to export session');
      }

      downloadExportFile(exportData, sessionName);
    } catch (err: any) {
      console.error('Export error:', err);
      setError(err.message || 'Failed to export session');
    } finally {
      setSaving(false);
    }
  };

  const handleImportSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    try {
      const data = await parseImportFile(file);
      setImportData(data);
      setConfirmImport(true);
    } catch (err: any) {
      setError(err.message || 'Failed to parse import file');
    }

    e.target.value = '';
  };

  const handleImportConfirm = async () => {
    if (!actor || !importData) return;

    setLoading(true);
    setError('');

    try {
      const result = await actor.importSession(importData);
      
      if (result.__kind__ === 'error') {
        throw new Error(result.error);
      }

      setConfirmImport(false);
      setImportData(null);
      alert('Session imported successfully! The page will reload.');
      window.location.reload();
    } catch (err: any) {
      console.error('Import error:', err);
      setError(err.message || 'Failed to import session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleExport} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Session
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <label className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              Load Session
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={handleImportSelect}
              />
            </label>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <AlertDialog open={confirmImport} onOpenChange={setConfirmImport}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Import Session</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace the current session with the imported data. All current channels, messages, and documents will be replaced. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleImportConfirm} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Import
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
