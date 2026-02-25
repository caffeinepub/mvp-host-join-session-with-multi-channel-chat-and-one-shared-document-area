import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useActor } from '../../hooks/useActor';
import { Community } from '../../backend';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CreateCommunityDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (communityId: bigint, community: Community) => void;
}

export default function CreateCommunityDialog({
  open,
  onClose,
  onCreated,
}: CreateCommunityDialogProps) {
  const { actor } = useActor();
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !actor) return;
    setIsCreating(true);
    try {
      const result = await actor.createCommunity(name.trim());
      if (result.__kind__ === 'ok') {
        const communityId = result.ok;
        const community = await actor.getCommunity(communityId);
        if (community) {
          onCreated(communityId, community);
          setName('');
          onClose();
        } else {
          toast.error('Community created but could not be loaded.');
        }
      } else {
        toast.error(result.error);
      }
    } catch (err: unknown) {
      toast.error('Failed to create community: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-cosmic-surface border-cosmic-border text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white text-xl">Create Community</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="text-white/80 text-sm">Community Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Cosmic Adventurers"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cosmic-accent/50"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              maxLength={60}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-white/20 text-white/70 hover:text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={isCreating || !name.trim()}
            className="bg-cosmic-accent hover:bg-cosmic-accent/80 text-white"
          >
            {isCreating ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
