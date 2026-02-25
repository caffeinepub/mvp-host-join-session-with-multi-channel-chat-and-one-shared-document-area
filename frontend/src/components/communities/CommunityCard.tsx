import React from 'react';
import { Community } from '../../backend';
import { Users, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CommunityCardProps {
  community: Community;
  onOpen: () => void;
}

export default function CommunityCard({ community, onOpen }: CommunityCardProps) {
  const bannerUrl = community.bannerImage ? community.bannerImage.getDirectURL() : null;
  const primaryColor = community.primaryColor ?? '#7c3aed';
  const accentColor = community.accentColor ?? '#a78bfa';

  return (
    <div
      className="relative rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all cursor-pointer group"
      style={{ background: `linear-gradient(135deg, ${primaryColor}22, #0d0a2e)` }}
      onClick={onOpen}
    >
      {/* Banner */}
      <div className="relative h-36 overflow-hidden">
        {bannerUrl ? (
          <img
            src={bannerUrl}
            alt={community.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url(/assets/generated/cosmic-banner-bg.dim_1200x400.png), linear-gradient(135deg, ${primaryColor}44, #0d0a2e)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60" />
      </div>

      {/* Info */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-base truncate">{community.name}</h3>
          <div className="flex items-center gap-1.5 mt-1">
            <Users size={12} className="text-white/40" />
            <span className="text-white/40 text-xs">Community</span>
          </div>
        </div>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onOpen();
          }}
          size="sm"
          className="ml-3 shrink-0 gap-1.5 text-white"
          style={{ backgroundColor: accentColor }}
        >
          <ExternalLink size={13} />
          Open
        </Button>
      </div>
    </div>
  );
}
