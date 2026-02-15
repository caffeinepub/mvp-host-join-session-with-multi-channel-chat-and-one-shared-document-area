import { useState } from 'react';
import { Avatar as UIAvatar, AvatarImage, AvatarFallback } from '../ui/avatar';

type AvatarProps = {
  imageUrl?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
};

export default function Avatar({ imageUrl, name, size = 'md', className = '' }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-16 w-16 text-lg',
  };

  const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const shouldShowImage = imageUrl && !imageError;

  return (
    <UIAvatar className={`${sizeClasses[size]} ${className}`}>
      {shouldShowImage && (
        <AvatarImage
          src={imageUrl}
          alt={name}
          onError={() => setImageError(true)}
        />
      )}
      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
        {getInitials(name)}
      </AvatarFallback>
    </UIAvatar>
  );
}
