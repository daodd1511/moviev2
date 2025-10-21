import { memo } from 'react';

import { IMAGE_BASE_URL } from '@/shared/constants';
import { ProfileSizes } from '@/shared/enums';
import { Cast as CastModel } from '@/models';

interface Props {

  /** Cast members to display. */
  readonly cast: readonly CastModel[];

  /** Title for the cast section. */
  readonly title?: string;
}

const CastComponent = ({ cast, title = 'Cast' }: Props) => {
  // Limit to first 10 cast members to avoid too many images
  const displayedCast = cast.slice(0, 10);

  return (
    <div className="pb-8">
      <h3 className="mb-4 text-lg font-medium">{title}</h3>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {displayedCast.map(person => {
          const imageUrl =
            person.profilePath != null ?
              `${IMAGE_BASE_URL}${ProfileSizes.medium}${String(person.profilePath)}` :
              '/images/no-profile.png';
          return (
            <div
              key={person.id}
              className="flex items-center space-x-3 rounded-lg p-2 transition-colors hover:bg-gray-100"
            >
              <img
                src={imageUrl}
                alt={person.name}
                className="h-12 w-12 rounded-full border border-gray-200 object-cover"
                onError={e => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/images/no-profile.png';
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{person.name}</p>
                <p className="truncate text-xs text-gray-500">
                  {person.character}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      {cast.length > 10 && (
        <p className="mt-2 text-sm text-gray-500">
          And {cast.length - 10} more...
        </p>
      )}
    </div>
  );
};

export const Cast = memo(CastComponent);
