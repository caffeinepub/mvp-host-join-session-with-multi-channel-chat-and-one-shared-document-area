import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { Community } from '../../backend';
import HostControlsDialog from './HostControlsDialog';

interface HostControlsButtonProps {
  communityId: bigint;
  community: Community;
}

export default function HostControlsButton({ communityId, community }: HostControlsButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 backdrop-blur-sm px-3 py-2 rounded-full transition-all text-sm font-medium"
        title="Host Controls"
      >
        <Settings size={16} />
        <span className="hidden sm:inline">Edit</span>
      </button>

      <HostControlsDialog
        open={open}
        onClose={() => setOpen(false)}
        communityId={communityId}
        community={community}
      />
    </>
  );
}
