import React, { useState } from 'react';
import { Loader2, UserCheck, UserX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useActor } from '../../hooks/useActor';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Principal } from '@dfinity/principal';

interface TabPermissionsDialogProps {
  communityId: string;
  onClose: () => void;
}

export default function TabPermissionsDialog({ communityId, onClose }: TabPermissionsDialogProps) {
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();
  const [newPrincipalInput, setNewPrincipalInput] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const { data: permittedMembers, isLoading } = useQuery({
    queryKey: ['tabPermissions', communityId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTabPermissions(communityId);
    },
    enabled: !!actor && !actorFetching,
  });

  const grantMutation = useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.grantTabReorderPermission(communityId, principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tabPermissions', communityId] });
      queryClient.invalidateQueries({ queryKey: ['canReorder', communityId] });
      setNewPrincipalInput('');
      setInputError(null);
    },
    onError: (err: Error) => {
      setInputError(err.message || 'Failed to grant permission');
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (principal: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.revokeTabReorderPermission(communityId, principal);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tabPermissions', communityId] });
      queryClient.invalidateQueries({ queryKey: ['canReorder', communityId] });
    },
  });

  const handleGrant = () => {
    setInputError(null);
    try {
      const principal = Principal.fromText(newPrincipalInput.trim());
      grantMutation.mutate(principal);
    } catch {
      setInputError('Invalid principal ID format');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Tab Reorder Permissions</DialogTitle>
          <DialogDescription>
            Grant members permission to reorder community tabs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Add new permission */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Grant Permission by Principal ID</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPrincipalInput}
                onChange={(e) => setNewPrincipalInput(e.target.value)}
                placeholder="Enter principal ID..."
                className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button
                size="sm"
                onClick={handleGrant}
                disabled={!newPrincipalInput.trim() || grantMutation.isPending}
              >
                {grantMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <UserCheck className="w-4 h-4" />
                )}
              </Button>
            </div>
            {inputError && (
              <p className="text-xs text-destructive">{inputError}</p>
            )}
          </div>

          {/* Current permitted members */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Members with Permission</label>
            {isLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </div>
            ) : !permittedMembers || permittedMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">
                No members have been granted tab reorder permission yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {permittedMembers.map((principal) => {
                  const principalStr = principal.toString();
                  const shortId = `${principalStr.slice(0, 8)}...${principalStr.slice(-4)}`;
                  return (
                    <div
                      key={principalStr}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded-md"
                    >
                      <span className="text-sm font-mono text-muted-foreground">{shortId}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => revokeMutation.mutate(principal)}
                        disabled={revokeMutation.isPending}
                        className="text-destructive hover:text-destructive h-7 px-2"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
