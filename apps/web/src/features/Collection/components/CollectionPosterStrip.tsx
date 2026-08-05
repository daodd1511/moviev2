import { FolderHeart } from 'lucide-react';

import type { CollectionItem } from '@/models/collection.model';
import { IMAGE_BASE_URL } from '@/shared/constants';
import { PosterSizes } from '@/shared/enums';
import { cn } from '@/lib/utils';

interface Props {
  /** Titles to render, in Collection order; only the first `limit` appear. */
  readonly items: readonly CollectionItem[];

  /** How many frames the strip shows. Defaults to five. */
  readonly limit?: number;

  /** Extra classes for the strip container. */
  readonly className?: string;
}

const frameKey = (item: CollectionItem): string => `${item.mediaType}:${item.tmdbId}`;

const posterUrl = (item: CollectionItem): string =>
  item.posterPath === null
    ? '/images/no-image.png'
    : `${IMAGE_BASE_URL}${PosterSizes.small}${item.posterPath}`;

/**
 * A Collection rendered as a contact sheet: its first few posters cropped into
 * adjacent frames. Purely decorative — the titles are always named in text elsewhere,
 * so every frame is `alt=""`.
 */
export const CollectionPosterStrip = ({ items, limit = 5, className }: Props) => {
  if (items.length === 0) {
    return (
      <div
        className={cn('flex items-center justify-center bg-surface/60', className)}
        aria-hidden="true"
      >
        <FolderHeart className="size-7 text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={cn('flex gap-px bg-foreground/10', className)} aria-hidden="true">
      {items.slice(0, limit).map(item => (
        <img
          key={frameKey(item)}
          src={posterUrl(item)}
          alt=""
          loading="lazy"
          className="h-full min-w-0 flex-1 object-cover"
        />
      ))}
    </div>
  );
};
