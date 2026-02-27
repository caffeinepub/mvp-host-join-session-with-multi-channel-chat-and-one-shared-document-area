import React from 'react';
import { ExternalLink, EyeOff, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Community } from '../../types/community';

interface CommunityCardProps {
  community: Community;
  onOpen: () => void;
  onHide?: () => void;
  isOwned?: boolean;
}

export default function CommunityCard({ community, onOpen, onHide, isOwned }: CommunityCardProps) {
  // Use accentColor from theme, fall back to primaryColor
  const accentColor = community.theme?.accentColor || community.theme?.primaryColor || '#7c3aed';
  const bgColor = community.theme?.backgroundColor || '#1a1a2e';

  // Use the correct field names from the Community type
  const coverUrl = community.coverUrl || null;
  const iconUrl = community.iconUrl || null;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      {/* Banner / Cover */}
      <div
        className="relative h-32 w-full"
        style={{
          background: coverUrl
            ? `url(${coverUrl}) center/cover no-repeat`
            : `linear-gradient(135deg, ${bgColor}, ${accentColor}40)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Icon */}
        <div className="absolute bottom-3 left-4">
          {iconUrl ? (
            <img
              src={iconUrl}
              alt={community.name}
              className="w-12 h-12 rounded-full border-2 border-white object-cover shadow-lg"
            />
          ) : (
            <div
              className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-lg shadow-lg"
              style={{ backgroundColor: accentColor }}
            >
              {community.name.slice(0, 1).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3 className="font-bold text-foreground text-base truncate">{community.name}</h3>
            {isOwned && (
              <Crown className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
            )}
          </div>
        </div>

        {community.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
            {community.description}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onOpen}
            className="flex-1 text-white font-medium"
            style={{ backgroundColor: accentColor }}
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
            Open
          </Button>
          {onHide && !isOwned && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onHide}
              className="text-muted-foreground hover:text-foreground px-2"
            >
              <EyeOff className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
