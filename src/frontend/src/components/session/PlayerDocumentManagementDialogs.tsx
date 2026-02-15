import { useState } from 'react';
import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import {
  useCreatePlayerDocument,
  useRenamePlayerDocument,
  useDeletePlayerDocument,
  useSetPlayerDocumentVisibility,
} from '../../hooks/usePlayerDocuments';
import type { PlayerDocument } from '../../backend';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Loader2, MoreVertical, Eye, EyeOff } from 'lucide-react';

type CreatePlayerDocumentDialogProps = {
  sessionId: bigint;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function CreatePlayerDocumentDialog({
  sessionId,
  open,
  onOpenChange,
}: CreatePlayerDocumentDialogProps) {
  const [name, setName] = useState('');
  const [visible, setVisible] = useState(true);
  const createMutation = useCreatePlayerDocument();

  const handleCreate = async () => {
    if (!name.trim()) return;

    try {
      const result = await createMutation.mutateAsync({
        sessionId,
        name: name.trim(),
        content: '',
        visible,
      });

      if (result.__kind__ === 'ok') {
        setName('');
        setVisible(true);
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error creating player document:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Player Document</DialogTitle>
          <DialogDescription>
            Create a new document that you own and control.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="doc-name">Document Name</Label>
            <Input
              id="doc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Character Sheet"
              disabled={createMutation.isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="doc-visible">Visible to Others</Label>
              <p className="text-xs text-muted-foreground">
                Allow other session members to view this document
              </p>
            </div>
            <Switch
              id="doc-visible"
              checked={visible}
              onCheckedChange={setVisible}
              disabled={createMutation.isPending}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={createMutation.isPending}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={!name.trim() || createMutation.isPending}>
            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type PlayerDocumentMenuProps = {
  document: PlayerDocument;
  isOwner: boolean;
};

export function PlayerDocumentMenu({ document, isOwner }: PlayerDocumentMenuProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [newName, setNewName] = useState(document.name);
  
  const renameMutation = useRenamePlayerDocument();
  const deleteMutation = useDeletePlayerDocument();
  const visibilityMutation = useSetPlayerDocumentVisibility();

  const handleRename = async () => {
    if (!newName.trim()) return;

    try {
      const result = await renameMutation.mutateAsync({
        documentId: document.id,
        newName: newName.trim(),
      });

      if (result.__kind__ === 'ok') {
        setRenameOpen(false);
      }
    } catch (error) {
      console.error('Error renaming document:', error);
    }
  };

  const handleDelete = async () => {
    try {
      const result = await deleteMutation.mutateAsync(document.id);

      if (result.__kind__ === 'ok') {
        setDeleteOpen(false);
      }
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const handleToggleVisibility = async () => {
    try {
      await visibilityMutation.mutateAsync({
        documentId: document.id,
        visible: !document.visible,
      });
    } catch (error) {
      console.error('Error toggling visibility:', error);
    }
  };

  if (!isOwner) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleToggleVisibility} disabled={visibilityMutation.isPending}>
            {document.visible ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Make Hidden
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Make Visible
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setRenameOpen(true)}>
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-destructive">
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Rename Dialog */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rename-input">New Name</Label>
              <Input
                id="rename-input"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                disabled={renameMutation.isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenameOpen(false)} disabled={renameMutation.isPending}>
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={!newName.trim() || renameMutation.isPending}>
              {renameMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Rename
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Document</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{document.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleteMutation.isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
