import { memo } from 'react';
import { Link, useParams } from 'react-router-dom';

import { IMAGE_BASE_URL } from '@/shared/constants';
import { ProfileSizes } from '@/shared/enums';
import { Credits } from '@/models';

interface Props {

  /** Credits containing cast and crew. */
  readonly credits: Credits;

  /** Title for the cast section. */
  readonly castTitle?: string;

  /** Whether to show cast section. */
  readonly showCast?: boolean;

  /** Number of casts to show. */
  readonly limit?: number;
}

const CastComponent = ({
  credits,
  castTitle = 'Cast',
  showCast = true,
  limit = 14,
}: Props) => {
  const { id } = useParams();
  
  // Extract media type from the current URL path
  const currentPath = window.location.pathname;
  let mediaType = 'movie'; // default to movie
  if (currentPath.startsWith('/tv/')) {
    mediaType = 'tv';
  } else if (currentPath.startsWith('/movie/')) {
    mediaType = 'movie';
  }

  return (
    <div>
      {showCast && credits.cast.length > 0 && (
        <div className="pb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">{castTitle}</h3>
            {credits.cast.length > limit && (
              <Link 
                to={`/${mediaType}/${id}/cast`}
                className="text-sm text-blue-600 hover:underline"
              >
                View all
              </Link>
            )}
          </div>
          <div className="grid grid-cols-autoFit-sm space-y-2 justify-start">
            {credits.cast.slice(0, limit).map(person => {
                const imageUrl =
                  person.profilePath != null ?
                    `${IMAGE_BASE_URL}${ProfileSizes.medium}${person.profilePath}` :
                    '/images/no-profile.png';

                return (
                  <div
                    key={person.id}
                    className="flex flex-col items-center gap-3 rounded-md p-2 transition-colors hover:bg-gray-100"
                  >
                    <div className="avatar w-32">
                      <img
                        src={imageUrl}
                        alt={person.name}
                        className="rounded-3xl object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1 text-center">
                      <p className="text-md truncate font-medium">
                        {person.name}
                      </p>
                      <p className="truncate text-sm text-gray-500">
                        {person.character}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
          {credits.cast.length > limit && (
            <Link 
              to={`/${mediaType}/${id}/cast`}
              className="block mt-2 text-sm text-blue-600 hover:underline"
            >
              And {credits.cast.length - limit} more...
            </Link>
          )}
        </div>
      )}
    </div>
  );
};

export const Cast = memo(CastComponent);
