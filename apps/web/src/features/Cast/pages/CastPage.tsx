import { memo, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import { Footer } from '@/shared/components/Footer';
import { NotFound } from '@/shared/components/NotFound';
import { MovieQueries } from '@/stores/queries/movieQueries';
import { TvQueries } from '@/stores/queries/tvQueries';
import { MediaType } from '@/shared/enums/mediaType';
import { assertNonNull, goToTop } from '@/shared/utils';
import { Loader } from '@/shared/components';
import { MovieDetail, TvDetail } from '@/models';
import { PosterSizes, ProfileSizes } from '@/shared/enums';

const CastPageComponent = () => {
  const { mediaType, id } = useParams();
  assertNonNull(mediaType, 'Media type is null');
  assertNonNull(id, 'Media id is null');

  const mediaId = parseInt(id, 10);

  // Determine if it's a movie or TV show
  const isMovie = mediaType === MediaType.Movie;

  // Fetch media data and credits based on media type
  const {
    data: media,
    isLoading: isMediaLoading,
    isError: isMediaError,
  } = isMovie ?
    MovieQueries.useDetail(mediaId) :
    TvQueries.useDetail(mediaId);

  const {
    data: credits,
    isLoading: isCreditsLoading,
    isError: isCreditsError,
  } = isMovie ?
    MovieQueries.useCredits(mediaId) :
    TvQueries.useCredits(mediaId);

  useEffect(() => {
    goToTop();
  }, []);

  if (isMediaLoading || isCreditsLoading) {
    return (
      <div className="h-withoutNavbar">
        <Loader />
      </div>
    );
  }

  if (isMediaError || isCreditsError || media == null || credits == null) {
    return <NotFound />;
  }

  // Get media title based on type
  const title = isMovie ? (media as MovieDetail).title : (media as TvDetail).name;
  const posterPath = isMovie ? (media as MovieDetail).posterPath : (media as TvDetail).posterPath;
  const releaseDate = isMovie ? (media as MovieDetail).releaseDate : (media as TvDetail).firstAirDate;
  const formattedReleaseDate = new Date(releaseDate);

  // Format release date
  const formattedDate = releaseDate !== '' ?
    formattedReleaseDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }) :
    '';

  return (
    <div className="p-5 md:p-10">
      <div className="text-sm breadcrumbs mb-5">
        <ul>
          <li><Link to="/">Home</Link></li>
          <li><Link to={`/${mediaType}`}>{isMovie ? 'Movies' : 'TV Shows'}</Link></li>
          <li><Link to={`/${mediaType}/${mediaId}`}>{title}</Link></li>
          <li>Cast & Crew</li>
        </ul>
      </div>

      {/* Header with basic info */}
      <div className="mb-10">
        <div className="flex flex-row items-center justify-start gap-8 ">
          <img
            src={posterPath !== null ? `https://image.tmdb.org/t/p/${PosterSizes.extraLarge}${posterPath}` : '/images/no-image.png'}
            alt={`${title} poster`}
            className="w-20 rounded-lg shadow-lg"
          />
          <div className="w-full md:w-3/4">
            <h1 className="text-3xl font-bold mb-4">{title}</h1>
            {formattedDate !== '' && (
              <p className="text-gray-600 mb-2">{formattedDate}</p>
            )}
          </div>
        </div>
      </div>

      {/* Cast and Crew sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
        {/* Cast Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-6 border-b pb-3">Cast</h2>
          <div className="space-y-4">
            {credits.cast.map((person, idx) => (
              <Link
                key={`${person.id}-${idx}`}
                to={`/person/${person.id}`}
                className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors block"
              >
                <div className="w-16 h-16 flex-shrink-0">
                  <img
                    src={person.profilePath !== null ? `https://image.tmdb.org/t/p/${ProfileSizes.medium}${person.profilePath}` : '/images/no-profile.png'}
                    alt={person.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{person.name}</p>
                  <p className="text-gray-600 truncate">{person.character}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Crew Section */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-6 border-b pb-3">Crew</h2>
          <div className="space-y-4">
            {credits.crew.map((person, idx) => (
              <Link
                key={`${person.id}-${idx}`}
                to={`/person/${person.id}`}
                className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors block"
              >
                <div className="w-16 h-16 flex-shrink-0">
                  <img
                    src={person.profilePath !== null ? `https://image.tmdb.org/t/p/${ProfileSizes.medium}${person.profilePath}` : '/images/no-profile.png'}
                    alt={person.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">{person.name}</p>
                  <p className="text-gray-600 truncate">{person.job}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export const CastPage = memo(CastPageComponent);
