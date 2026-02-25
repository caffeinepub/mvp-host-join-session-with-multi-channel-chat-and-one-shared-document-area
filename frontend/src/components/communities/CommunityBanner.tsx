import React from 'react';
import { ExternalBlob } from '../../backend';

interface CommunityBannerProps {
  name: string;
  description: string;
  bannerImage: ExternalBlob | null;
  primaryColor: string | null;
}

export default function CommunityBanner({
  name,
  description,
  bannerImage,
  primaryColor,
}: CommunityBannerProps) {
  const bannerUrl = bannerImage ? bannerImage.getDirectURL() : null;

  const fallbackStyle: React.CSSProperties = bannerUrl
    ? {
        backgroundImage: `url(${bannerUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : {
        backgroundImage: `url(/assets/generated/cosmic-banner-bg.dim_1200x400.png), linear-gradient(135deg, #0d0a2e 0%, #1a0f3d 40%, #2d1b5e 70%, #1e0a3a 100%)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };

  return (
    <div
      className="relative w-full"
      style={{ minHeight: '260px', ...fallbackStyle }}
    >
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/60" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-end h-full px-6 pb-8 pt-16" style={{ minHeight: '260px' }}>
        <h1
          className="text-4xl md:text-5xl font-extrabold text-white text-center drop-shadow-lg leading-tight"
          style={{ textShadow: '0 2px 16px rgba(0,0,0,0.7)' }}
        >
          {name}
        </h1>
        {description && (
          <p
            className="mt-3 text-base md:text-lg text-white/80 text-center max-w-xl font-medium"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
