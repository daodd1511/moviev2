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
    return <Loader className="min-h-[60vh]" />;
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
      <div className="mb-5 text-sm">
        <ul className="flex flex-wrap items-center gap-2 [&>li:not(:first-child)]:before:mr-2 [&>li:not(:first-child)]:before:text-muted-foreground [&>li:not(:first-child)]:before:content-['/']">
          <li>
            <Link to="/" className="text-primary hover:underline">Home</Link>
          </li>
          <li className="text-muted-foreground">Person</li>
          <li className="text-muted-foreground">{personDetail.name}</li>
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
          <h1 className="mb-4 text-3xl font-bold text-foreground">{personDetail.name}</h1>

          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            {formattedBirthday && (
              <div>
                <h3 className="font-semibold text-muted-foreground">Born</h3>
                <p className="text-foreground">{formattedBirthday}</p>
              </div>
            )}
            {formattedDeathday && (
              <div>
                <h3 className="font-semibold text-muted-foreground">Died</h3>
                <p className="text-foreground">{formattedDeathday}</p>
              </div>
            )}
            {personDetail.place_of_birth && (
              <div>
                <h3 className="font-semibold text-muted-foreground">Place of Birth</h3>
                <p className="text-foreground">{personDetail.place_of_birth}</p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="mb-2 font-semibold text-muted-foreground">Biography</h3>
            <p className="whitespace-pre-line text-foreground">
              {displayBiography}
            </p>
            {isLongBiography && (
              <button
                type="button"
                onClick={() => setShowFullBiography(!showFullBiography)}
                className="mt-2 text-primary hover:underline"
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
