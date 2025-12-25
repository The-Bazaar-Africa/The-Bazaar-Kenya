'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@tbk/ui';

interface CategoryCardProps {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  icon?: string;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CategoryCard({
  id,
  name,
  slug,
  imageUrl,
  icon,
  isActive = false,
  onClick,
  className,
}: CategoryCardProps) {
  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-300 cursor-pointer min-w-[100px]',
        'bg-card hover:bg-accent border border-border',
        isActive && 'bg-primary text-primary-foreground border-primary',
        className
      )}
      onClick={onClick}
    >
      {imageUrl ? (
        <div className="relative w-12 h-12 mb-2 rounded-full overflow-hidden">
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes="48px"
          />
        </div>
      ) : icon ? (
        <span className="text-3xl mb-2">{icon}</span>
      ) : (
        <div className="w-12 h-12 mb-2 rounded-full bg-muted flex items-center justify-center">
          <span className="text-lg font-bold text-muted-foreground">
            {name.charAt(0)}
          </span>
        </div>
      )}
      <span className={cn(
        'text-sm font-medium text-center line-clamp-1',
        isActive ? 'text-primary-foreground' : 'text-foreground'
      )}>
        {name}
      </span>
    </div>
  );

  if (onClick) {
    return content;
  }

  return (
    <Link href={`/categories/${slug}`}>
      {content}
    </Link>
  );
}
