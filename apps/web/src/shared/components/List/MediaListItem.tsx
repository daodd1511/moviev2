import { memo } from 'react';
import { Link } from 'react-router-dom';

import { MoreHorizontal, Star } from 'lucide-react';

import { IMAGE_BASE_URL } from '../../constants';
import { PosterSizes } from '../../enums';
import { formatToYear } from '../../utils';

import { Media } from '@/models';
import { CollectionMenu } from '@/shared/components/Collection/Menu';
import { LibraryAction } from '@/shared/components/LibraryAction';
import { PosterPlate } from '@/shared/components/ui/PosterPlate';

interface Props {
  /** Movie data. */
  readonly media: Media;
}

const MediaListItemComponent = ({ media }: Props) => {
  const imageURL =
    media.posterPath != null
      ? `${IMAGE_BASE_URL}${PosterSizes.large}${media.posterPath}`
      : '/images/no-image.png';

  return (
    <div className="group relative">
      <Link to={`/${media.type}/${media.id}`} className="block">
        <PosterPlate
          src={imageURL}
          alt={`${media.title} poster`}
          loading="lazy"
          className="transition-transform duration-300 group-hover:scale-[1.02]"
        >
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 to-transparent px-3.5 pt-9 pb-3">
            <p className="truncate text-sm font-medium text-foreground">{media.title}</p>
            <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span>{formatToYear(media.releaseDate)}</span>
              <span className="inline-flex items-center gap-1 text-primary">
                <Star className="h-3 w-3 fill-current" />
                {media.voteAverage.toFixed(1)}
              </span>
            </p>
          </div>
        </PosterPlate>
      </Link>
      <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 sm:gap-2 [@media(hover:none)]:opacity-100">
        <LibraryAction
          media={media}
          iconOnly
          className="h-9 w-9 rounded-full border border-foreground/15 bg-background/60 text-foreground shadow-[0_8px_20px_-10px_rgba(0,0,0,0.9)] backdrop-blur-sm hover:border-foreground/25 hover:bg-background/80 sm:h-11 sm:w-11"
        />
        <CollectionMenu
          media={media}
          triggerLabel="Open item menu"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-foreground/15 bg-background/60 text-foreground shadow-[0_8px_20px_-10px_rgba(0,0,0,0.9)] backdrop-blur-sm hover:border-foreground/25 hover:bg-background/80 sm:h-11 sm:w-11"
          trigger={<MoreHorizontal className="h-4 w-4" />}
        />
      </div>
    </div>
  );
};

export const MediaListItem = memo(MediaListItemComponent);
