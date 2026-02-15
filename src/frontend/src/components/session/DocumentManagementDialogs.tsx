import { useState } from 'react';
import { useActor } from '../../hooks/useActor';
import type { Document } from '../../backend';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
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
};

export default function DocumentManagementDialogs({
  sessionId,
  document,
  isCreateDialog,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSuccess,
}: DocumentManagementDialogsProps) {
  const { actor } = useActor();
  const [showRename, setShowRename] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isControlled = controlledOpen !== undefined;
  const createOpen = isControlled ? controlledOpen : false;

  const handleCreate = async () => {
    if (!actor || !sessionId || !name.trim()) {
      setError('Please enter a document name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await actor.createDocument(sessionId, name.trim(), content.trim());
      if (result.__kind__ === 'error') {
        setError(result.error);
        return;
      }

      setName('');
      setContent('');
      if (controlledOnOpenChange) controlledOnOpenChange(false);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create document');
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!actor || !document || !name.trim()) {
      setError('Please enter a document name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await actor.renameDocument(document.id, name.trim());
      if (result.__kind__ === 'error') {
        setError(result.error);
        return;
      }

      setName('');
      setShowRename(false);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to rename document');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!actor || !document) return;

    setLoading(true);

    try {
      const result = await actor.deleteDocument(document.id);
      if (result.__kind__ === 'error') {
        alert(result.error);
        return;
      }

      setShowDelete(false);
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Failed to delete document');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLock = async () => {
    if (!actor || !document) return;

    setLoading(true);

    try {
      const result = document.locked
        ? await actor.unlockDocument(document.id)
        : await actor.lockDocument(document.id);

      if (result.__kind__ === 'error') {
        alert(result.error);
        return;
      }

      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle lock');
    } finally {
      setLoading(false);
    }
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
            <div className="space-y-2">
              <Label htmlFor="doc-content">Initial Content (Optional)</Label>
              <Textarea
                id="doc-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter initial content..."
                rows={4}
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => controlledOnOpenChange?.(false)} disabled={loading}>
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
      <DropdownMenuItem onClick={handleToggleLock} disabled={loading}>
        {document?.locked ? (
          <>
            <Unlock className="mr-2 h-4 w-4" />
            Unlock
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Lock
          </>
        )}
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setShowDelete(true)} className="text-destructive">
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </DropdownMenuItem>

      {/* Rename Dialog */}
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

      {/* Delete Confirmation */}
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
