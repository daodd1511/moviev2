import { memo } from 'react';

import { IMAGE_BASE_URL } from '@/shared/constants';
import { ProfileSizes } from '@/shared/enums';
import { Credits } from '@/models';

interface Props {

  /** Credits containing cast and crew. */
  readonly credits: Credits;

  /** Title for the cast section. */
  readonly castTitle?: string;

  /** Title for the crew section. */
  readonly crewTitle?: string;

  /** Whether to show cast section. */
  readonly showCast?: boolean;

  /** Whether to show crew section. */
  readonly showCrew?: boolean;

  /** Number of casts/crews to show. */
  readonly limit?: number;
}

// Define important crew departments and jobs
const IMPORTANT_DEPARTMENTS = ['Directing', 'Writing', 'Production'];
const IMPORTANT_JOBS = ['Director', 'Writer', 'Producer', 'Executive Producer', 'Creator'];

const CastComponent = ({
  credits,
  castTitle = 'Cast',
  crewTitle = 'Crew',
  showCast = true,
  showCrew = true,
  limit = 8,
}: Props) => {
  // Filter important crew members
  const importantCrew = credits.crew.filter(crew =>
    IMPORTANT_DEPARTMENTS.includes(crew.department) ||
    IMPORTANT_JOBS.includes(crew.job));

  return (
    <div>
      {/* Cast Section */}
      {showCast && credits.cast.length > 0 && (
        <div className="pb-8">
          <h3 className="mb-4 text-lg font-medium">{castTitle}</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {credits.cast.slice(0, limit).map(person => {
              const imageUrl = person.profilePath != null ?
                `${IMAGE_BASE_URL}${ProfileSizes.medium}${person.profilePath}` :
                '/images/no-profile.png';

              return (
                <div key={person.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <img
                    src={imageUrl}
                    alt={person.name}
                    className="w-24 h-24 rounded-full object-cover border border-gray-200"
                    onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/no-profile.png';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-md font-medium truncate">{person.name}</p>
                    <p className="text-sm text-gray-500 truncate">{person.character}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {credits.cast.length > limit && (
            <p className="text-sm text-gray-500 mt-2">And {credits.cast.length - limit} more...</p>
          )}
        </div>
      )}

      {/* Crew Section */}
      {showCrew && importantCrew.length > 0 && (
        <div className="pb-8">
          <h3 className="mb-4 text-lg font-medium">{crewTitle}</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {importantCrew.slice(0, limit).map(person => {
              const imageUrl = person.profilePath != null ?
                `${IMAGE_BASE_URL}${ProfileSizes.medium}${person.profilePath}` :
                '/images/no-profile.png';

              return (
                <div key={person.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <img
                    src={imageUrl}
                    alt={person.name}
                    className="w-24 h-24 rounded-full object-cover border border-gray-200"
                    onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/no-profile.png';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-md font-medium truncate">{person.name}</p>
                    <p className="text-sm text-gray-500 truncate">{person.job}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {importantCrew.length > limit && (
            <p className="text-sm text-gray-500 mt-2">And {importantCrew.length - limit} more...</p>
          )}
        </div>
      )}
    </div>
  );
};

export const Cast = memo(CastComponent);
