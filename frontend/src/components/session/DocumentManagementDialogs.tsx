import { useState } from 'react';
import type { Document } from '../../types/session';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
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
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { Loader2, Edit, Trash2, Lock, Unlock } from 'lucide-react';

type DocumentManagementDialogsProps = {
  sessionId?: bigint;
  document?: Document;
  isCreateDialog?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess: () => void;
  onCreated?: (documentId: bigint) => void;
};

export default function DocumentManagementDialogs({
  sessionId,
  document,
  isCreateDialog,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSuccess,
  onCreated,
}: DocumentManagementDialogsProps) {
  const [showRename, setShowRename] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isControlled = controlledOpen !== undefined;
  const createOpen = isControlled ? controlledOpen : false;

  const handleCreate = async () => {
    setError('Document creation is not available in the current version.');
  };

  const handleRename = async () => {
    setError('Document renaming is not available in the current version.');
  };

  const handleDelete = async () => {
    setShowDelete(false);
    alert('Document deletion is not available in the current version.');
  };

  const handleToggleLock = async () => {
    alert('Document lock/unlock is not available in the current version.');
  };

  if (isCreateDialog) {
    return (
      <Dialog open={createOpen} onOpenChange={controlledOnOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Document</DialogTitle>
            <DialogDescription>Add a new document to your session.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="doc-name">Document Name</Label>
              <Input
                id="doc-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Campaign Notes"
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => controlledOnOpenChange?.(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={loading || !name.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <DropdownMenuItem onClick={() => { setName(document?.name || ''); setShowRename(true); }}>
        <Edit className="mr-2 h-4 w-4" />
        Rename
      </DropdownMenuItem>
      <DropdownMenuItem onClick={handleToggleLock}>
        {document?.locked ? (
          <><Unlock className="mr-2 h-4 w-4" />Unlock</>
        ) : (
          <><Lock className="mr-2 h-4 w-4" />Lock</>
        )}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setShowDelete(true)} className="text-destructive">
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </DropdownMenuItem>

      <Dialog open={showRename} onOpenChange={setShowRename}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Document</DialogTitle>
            <DialogDescription>Change the name of this document.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="rename-doc">Document Name</Label>
              <Input
                id="rename-doc"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRename(false)} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={loading || !name.trim()}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDelete} onOpenChange={setShowDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{document?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
