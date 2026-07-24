import { memo } from 'react';
import { Link } from 'react-router-dom';

import { IMAGE_BASE_URL } from '@/shared/constants';
import { ProfileSizes } from '@/shared/enums';
import { Credits } from '@/models';
import { MediaType } from '@/shared/enums/mediaType';
import { Rail } from '@/shared/components/ui/Rail';

interface Props {

  /** Credits containing cast and crew. */
  readonly credits: Credits;

  /** Media type, for the "view all" link — passed explicitly rather than inferred from the URL. */
  readonly mediaType: MediaType;

  /** Media id, for the "view all" link. */
  readonly mediaId: number;

  /** Title for the cast section. */
  readonly castTitle?: string;

  /** Number of casts to show. */
  readonly limit?: number;
}

const CastComponent = ({
  credits,
  mediaType,
  mediaId,
  castTitle = 'Cast',
  limit = 14,
}: Props) => {
  if (credits.cast.length === 0) {
    return null;
  }

  return (
    <Rail
      title={castTitle}
      viewAllTo={credits.cast.length > limit ? `/${mediaType}/${mediaId}/cast` : undefined}
    >
      <div className="grid auto-cols-[8rem] grid-flow-col gap-3 overflow-x-auto pb-4 sm:auto-cols-[9.5rem] sm:gap-5">
        {credits.cast.slice(0, limit).map(person => {
          const imageUrl =
            person.profilePath != null ?
              `${IMAGE_BASE_URL}${ProfileSizes.medium}${person.profilePath}` :
              '/images/no-profile.png';

          return (
            <Link key={person.id} to={`/person/${person.id}`} className="group">
              <img
                src={imageUrl}
                alt={person.name}
                loading="lazy"
                className="mb-2.5 aspect-2/3 w-full rounded-md object-cover transition-transform duration-200 group-hover:-translate-y-1"
              />
              <p className="truncate text-sm font-medium text-foreground">
                {person.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {person.character}
              </p>
            </Link>
          );
        })}
      </div>
    </Rail>
  );
};

export const Cast = memo(CastComponent);
