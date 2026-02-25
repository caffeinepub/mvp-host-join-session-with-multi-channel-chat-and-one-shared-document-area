import React from 'react';
import { useGetMemberTabReorderPermissions, useUpdateMemberTabReorderPermission } from '../../hooks/useQueries';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Users } from 'lucide-react';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';

interface MemberPermissionsPanelProps {
  communityId: bigint;
}

export default function MemberPermissionsPanel({ communityId }: MemberPermissionsPanelProps) {
  const { data: permissions, isLoading } = useGetMemberTabReorderPermissions(communityId);
  const updatePermission = useUpdateMemberTabReorderPermission(communityId);

  const handleToggle = (member: Principal, currentValue: boolean) => {
    updatePermission.mutate(
      { member, canReorderTabs: !currentValue },
      {
        onSuccess: (result) => {
          if (result.__kind__ === 'ok') {
            toast.success('Permission updated.');
          } else {
            toast.error(result.error);
          }
        },
        onError: (err) => {
          toast.error('Failed to update permission: ' + err.message);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
            <Skeleton className="h-4 w-32 bg-white/10" />
            <Skeleton className="h-5 w-10 bg-white/10 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!permissions || permissions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <Users size={32} className="text-white/20 mb-3" />
        <p className="text-white/40 text-sm">No members with custom permissions yet.</p>
        <p className="text-white/25 text-xs mt-1">
          Members who join the community will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-white/60 text-xs mb-3">
        Toggle tab reorder permission for individual members.
      </p>
      {permissions.map(([principal, canReorder]) => {
        const principalStr = principal.toString();
        const shortId = principalStr.slice(0, 12) + '...';
        return (
          <div
            key={principalStr}
            className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
          >
            <div>
              <p className="text-white text-sm font-medium">{shortId}</p>
              <p className="text-white/40 text-xs">
                {canReorder ? 'Can reorder tabs' : 'Cannot reorder tabs'}
              </p>
            </div>
            <Switch
              checked={canReorder}
              onCheckedChange={() => handleToggle(principal as Principal, canReorder)}
              disabled={updatePermission.isPending}
              className="data-[state=checked]:bg-cosmic-accent"
            />
          </div>
        );
      })}
    </div>
  );
}
