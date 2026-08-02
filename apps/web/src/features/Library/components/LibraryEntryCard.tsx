import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { LibraryEntry } from '@/models/library-entry.model';
import { PosterPlate } from '@/shared/components/ui/PosterPlate';
import { IMAGE_BASE_URL } from '@/shared/constants';
import { PosterSizes } from '@/shared/enums';

import { LibraryEntryEditor } from './LibraryEntryEditor';

interface Props {
  readonly entry: LibraryEntry;
}

const labels = {
  planned: 'Watchlist',
  watching: 'Watching',
  completed: 'Completed',
  paused: 'Paused',
  dropped: 'Dropped',
} as const;

export const LibraryEntryCard = ({ entry }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const { mediaSnapshot } = entry;
  const imageUrl =
    mediaSnapshot.posterPath === null
      ? '/images/no-image.png'
      : `${IMAGE_BASE_URL}${PosterSizes.large}${mediaSnapshot.posterPath}`;

  const handleEditToggle = () => setIsEditing(value => !value);

  return (
    <article className="rounded-xl border border-border bg-card/70 p-4">
      <div className="flex gap-4">
        <Link to={`/${entry.mediaType}/${entry.tmdbId}`} className="w-20 shrink-0">
          <PosterPlate src={imageUrl} alt={`${mediaSnapshot.title} poster`} loading="lazy" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-wide text-primary uppercase">
            {labels[entry.watchState]}
          </p>
          <h2 className="mt-1 truncate text-lg font-semibold">{mediaSnapshot.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {entry.mediaType === 'tv' ? 'TV show' : 'Movie'}
            {entry.rating !== null && (
              <span className="ml-2 inline-flex items-center gap-1">
                <Star className="size-3 fill-current text-primary" aria-hidden="true" />
                {entry.rating}/10
              </span>
            )}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={handleEditToggle}
            aria-expanded={isEditing}
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            {isEditing ? 'Close editor' : 'Edit'}
          </Button>
        </div>
      </div>
      {isEditing && <LibraryEntryEditor entry={entry} />}
    </article>
  );
};
