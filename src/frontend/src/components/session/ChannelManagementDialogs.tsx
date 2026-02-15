import { useState } from 'react';
import { useActor } from '../../hooks/useActor';
import type { Channel } from '../../backend';
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
import { Loader2, Edit, Trash2 } from 'lucide-react';

type ChannelManagementDialogsProps = {
  sessionId?: bigint;
  channel?: Channel;
  isCreateDialog?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess: () => void;
};

export default function ChannelManagementDialogs({
  sessionId,
  channel,
  isCreateDialog,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSuccess,
}: ChannelManagementDialogsProps) {
  const { actor } = useActor();
  const [showRename, setShowRename] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isControlled = controlledOpen !== undefined;
  const createOpen = isControlled ? controlledOpen : false;

  const handleCreate = async () => {
    if (!actor || !sessionId || !name.trim()) {
      setError('Please enter a channel name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await actor.createChannel(sessionId, name.trim());
      if (result.__kind__ === 'error') {
        setError(result.error);
        return;
      }

      setName('');
      if (controlledOnOpenChange) controlledOnOpenChange(false);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create channel');
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async () => {
    if (!actor || !channel || !sessionId || !name.trim()) {
      setError('Please enter a channel name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await actor.renameChannel(sessionId, channel.id, name.trim());
      if (result.__kind__ === 'error') {
        setError(result.error);
        return;
      }

      setName('');
      setShowRename(false);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to rename channel');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!actor || !channel || !sessionId) return;

    setLoading(true);

    try {
      const result = await actor.deleteChannel(sessionId, channel.id);
      if (result.__kind__ === 'error') {
        alert(result.error);
        return;
      }

      setShowDelete(false);
      onSuccess();
    } catch (err: any) {
      alert(err.message || 'Failed to delete channel');
    } finally {
      setLoading(false);
    }
  };

  if (isCreateDialog) {
    return (
      <Dialog open={createOpen} onOpenChange={controlledOnOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Channel</DialogTitle>
            <DialogDescription>Add a new channel to your session.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="channel-name">Channel Name</Label>
              <Input
                id="channel-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Scene 1"
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
      <DropdownMenuItem onClick={() => { setName(channel?.name || ''); setShowRename(true); }}>
        <Edit className="mr-2 h-4 w-4" />
        Rename
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => setShowDelete(true)} className="text-destructive">
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </DropdownMenuItem>

      {/* Rename Dialog */}
      <Dialog open={showRename} onOpenChange={setShowRename}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Channel</DialogTitle>
            <DialogDescription>Change the name of this channel.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="rename-channel">Channel Name</Label>
              <Input
                id="rename-channel"
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
            <AlertDialogTitle>Delete Channel</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{channel?.name}"? This action cannot be undone.
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
