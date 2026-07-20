/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { memo, FC, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { PersonQueries } from '@/stores/queries/personQueries';
import { Footer } from '@/shared/components/Footer';
import { Loader } from '@/shared/components';
import { NotFound } from '@/shared/components/NotFound';
import { MediaList } from '@/shared/components/List/MediaList';
import { IMAGE_BASE_URL } from '@/shared/constants';
import { ProfileSizes } from '@/shared/enums';
import { Media } from '@/models';

const PersonComponent: FC = () => {
  const { id } = useParams();
  const personId = Number(id);

  const {
    data: personDetail,
    isLoading: isDetailLoading,
    isError: isDetailError,
  } = PersonQueries.useDetail(personId);

  const {
    data: personCredits,
    isLoading: isCreditsLoading,
    isError: isCreditsError,
  } = PersonQueries.useCombinedCredits(personId);

  const [showFullBiography, setShowFullBiography] = useState(false);

  // Convert credits to Media objects for the MediaList component
  const knownFor =
    personCredits != null ?
      [
        ...personCredits.cast.map(item => new Media({
          id: item.id,
          type: item.mediaType === 'movie' ? 'movie' : 'tv',
          title: item.title || item.name,
          releaseDate: item.mediaType === 'movie' ? item.releaseDate : item.firstAirDate,
          voteAverage: item.voteAverage || 0,
          posterPath: item.posterPath,
        })),
        ...personCredits.crew.map(item => new Media({
          id: item.id,
          type: item.mediaType === 'movie' ? 'movie' : 'tv',
          title: item.title || item.name,
          releaseDate: item.mediaType === 'movie' ? item.releaseDate : item.firstAirDate,
          voteAverage: item.voteAverage || 0,
          posterPath: item.posterPath,
        })),
      ]
        .filter(
          (value, index, self) =>
              index === self.findIndex(t => t.id === value.id),
        )
        .sort((a, b) => b.voteAverage - a.voteAverage)
        .slice(0, 12) :
      [];

  if (isDetailLoading || isCreditsLoading) {
    return (
      <div className="h-withoutNavbar">
        <Loader />
      </div>
    );
  }

  if (isDetailError || isCreditsError || !personDetail) {
    return <NotFound />;
  }

  const imageUrl =
    personDetail.profilePath != null ?
      `${IMAGE_BASE_URL}${ProfileSizes.original}${String(
          personDetail.profilePath,
      )}` :
      '/images/no-profile.png';

  // Format birthday
  const formattedBirthday =
    personDetail.birthday != null ?
      new Date(personDetail.birthday).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
      }) :
      null;

  // Format deathday
  const formattedDeathday =
    personDetail.deathday != null ?
      new Date(personDetail.deathday).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
      }) :
      null;

  // Limit biography length if too long
  const isLongBiography =
    personDetail.biography != null && personDetail.biography.length > 300;
  const displayBiography = showFullBiography ?
    personDetail.biography :
    isLongBiography ?
      `${personDetail.biography?.substring(0, 300)}...` :
    personDetail.biography;

  return (
    <div className="p-5 md:p-10">
      <div className="breadcrumbs mb-5 text-sm">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>Person</li>
          <li>{personDetail.name}</li>
        </ul>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        {/* Image section */}
        <div className="flex w-full justify-start md:w-1/3">
          <img
            src={imageUrl}
            alt={`${personDetail.name} profile`}
            className="w-full max-w-xs rounded-lg shadow-lg"
          />
        </div>

        {/* Info section - matches height with image */}
        <div className="w-full md:w-2/3">
          <h1 className="mb-4 text-3xl font-bold">{personDetail.name}</h1>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {formattedBirthday && (
              <div>
                <h3 className="font-semibold text-gray-700">Born</h3>
                <p>{formattedBirthday}</p>
              </div>
            )}
            {formattedDeathday && (
              <div>
                <h3 className="font-semibold text-gray-700">Died</h3>
                <p>{formattedDeathday}</p>
              </div>
            )}
            {personDetail.place_of_birth && (
              <div>
                <h3 className="font-semibold text-gray-700">Place of Birth</h3>
                <p>{personDetail.place_of_birth}</p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="mb-2 font-semibold text-gray-700">Biography</h3>
            <p className="whitespace-pre-line text-gray-700">
              {displayBiography}
            </p>
            {isLongBiography && (
              <button
                onClick={() => setShowFullBiography(!showFullBiography)}
                className="mt-2 text-blue-600 hover:underline"
              >
                {showFullBiography ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Known For section */}
      <div className="mt-12">
        <h2 className="mb-6 text-2xl font-bold">Known For</h2>
        <MediaList data={knownFor} />
      </div>

      <Footer />
    </div>
  );
};

export const PersonPage = memo(PersonComponent);
