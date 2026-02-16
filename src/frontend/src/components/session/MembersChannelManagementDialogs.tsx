import { useState } from 'react';
import { useCreateMembersChannel, useRenameMembersChannel, useDeleteMembersChannel } from '../../hooks/useSessionData';
import type { MembersChannel } from '../../backend';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
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

type MembersChannelManagementDialogsProps = {
  sessionId: bigint;
  channel?: MembersChannel;
  isCreateDialog?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onSuccess?: () => void;
};

export default function MembersChannelManagementDialogs({
  sessionId,
  channel,
  isCreateDialog = false,
  open,
  onOpenChange,
  onSuccess,
}: MembersChannelManagementDialogsProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [error, setError] = useState('');

  const createMutation = useCreateMembersChannel();
  const renameMutation = useRenameMembersChannel();
  const deleteMutation = useDeleteMembersChannel();

  const handleCreate = async () => {
    if (!channelName.trim()) {
      setError('Channel name is required');
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        sessionId,
        name: channelName.trim(),
      });

      if (result.__kind__ === 'ok') {
        setChannelName('');
        setError('');
        if (isCreateDialog && onOpenChange) {
          onOpenChange(false);
        } else {
          setShowCreate(false);
        }
        onSuccess?.();
      } else {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create channel');
    }
  };

  const handleRename = async () => {
    if (!channel || !channelName.trim()) {
      setError('Channel name is required');
      return;
    }

    try {
      const result = await renameMutation.mutateAsync({
        sessionId,
        channelId: channel.id,
        newName: channelName.trim(),
      });

      if (result.__kind__ === 'ok') {
        setChannelName('');
        setError('');
        setShowRename(false);
        onSuccess?.();
      } else {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to rename channel');
    }
  };

  const handleDelete = async () => {
    if (!channel) return;

    try {
      const result = await deleteMutation.mutateAsync({
        sessionId,
        channelId: channel.id,
      });

      if (result.__kind__ === 'ok') {
        setShowDelete(false);
        onSuccess?.();
      } else {
        setError(result.error);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete channel');
    }
  };

  if (isCreateDialog) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Members' Channel</DialogTitle>
            <DialogDescription>
              Create a new channel that any member can use for collaboration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="channel-name">Channel Name</Label>
              <Input
                id="channel-name"
                value={channelName}
                onChange={(e) => {
                  setChannelName(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="e.g., Party Chat"
                autoFocus
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setChannelName('');
                setError('');
                onOpenChange?.(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (!channel) return null;

  return (
    <>
      <DropdownMenuItem
        onClick={() => {
          setChannelName(channel.name);
          setShowRename(true);
        }}
      >
        <Pencil className="mr-2 h-4 w-4" />
        Rename
      </DropdownMenuItem>
      <DropdownMenuItem
        onClick={() => setShowDelete(true)}
        className="text-destructive focus:text-destructive"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </DropdownMenuItem>

      {/* Rename Dialog */}
      <Dialog open={showRename} onOpenChange={setShowRename}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Channel</DialogTitle>
            <DialogDescription>
              Enter a new name for this members' channel.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename-channel">Channel Name</Label>
              <Input
                id="rename-channel"
                value={channelName}
                onChange={(e) => {
                  setChannelName(e.target.value);
                  setError('');
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                autoFocus
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setChannelName('');
                setError('');
                setShowRename(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={renameMutation.isPending}>
              {renameMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Renaming...
                </>
              ) : (
                'Rename'
              )}
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
              Are you sure you want to delete "{channel.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setError('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
