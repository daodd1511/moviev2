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
import { Kicker } from '@/shared/components/ui/Kicker';

const CastPageComponent = () => {
  const { mediaType, id } = useParams();
  assertNonNull(mediaType, 'Media type is null');
  assertNonNull(id, 'Media id is null');

  const mediaId = parseInt(id, 10);

  const isMovie = mediaType === MediaType.Movie;

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
      <div className="min-h-[60vh]">
        <Loader />
      </div>
    );
  }

  if (isMediaError || isCreditsError || media == null || credits == null) {
    return <NotFound />;
  }

  const title = isMovie ? (media as MovieDetail).title : (media as TvDetail).name;
  const posterPath = isMovie ? (media as MovieDetail).posterPath : (media as TvDetail).posterPath;
  const releaseDate = isMovie ? (media as MovieDetail).releaseDate : (media as TvDetail).firstAirDate;
  const formattedReleaseDate = new Date(releaseDate);

  const formattedDate = releaseDate !== '' ?
    formattedReleaseDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }) :
    '';

  return (
    <div className="p-5 md:p-10">
      <div className="mb-5 text-sm">
        <ul className="flex flex-wrap items-center gap-2 [&>li:not(:first-child)]:before:mr-2 [&>li:not(:first-child)]:before:text-muted-foreground [&>li:not(:first-child)]:before:content-['/']">
          <li><Link to="/" className="text-primary hover:underline">Home</Link></li>
          <li><Link to={`/${mediaType}`} className="text-primary hover:underline">{isMovie ? 'Movies' : 'TV Shows'}</Link></li>
          <li><Link to={`/${mediaType}/${mediaId}`} className="text-primary hover:underline">{title}</Link></li>
          <li className="text-muted-foreground">Cast &amp; Crew</li>
        </ul>
      </div>

      <div className="mb-10 flex flex-row items-center justify-start gap-8">
        <img
          src={posterPath !== null ? `https://image.tmdb.org/t/p/${PosterSizes.extraLarge}${posterPath}` : '/images/no-image.png'}
          alt={`${title} poster`}
          className="w-20 rounded-md shadow-lg"
        />
        <div className="w-full md:w-3/4">
          <h1 className="mb-4 text-3xl font-bold text-foreground">{title}</h1>
          {formattedDate !== '' && (
            <p className="mb-2 text-muted-foreground">{formattedDate}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 pb-10 md:grid-cols-2">
        <div className="rounded-md border border-border bg-card p-6">
          <Kicker className="border-b border-border pb-3">Cast</Kicker>
          <div className="space-y-4">
            {credits.cast.map((person, idx) => (
              <Link
                key={`${person.id}-${idx}`}
                to={`/person/${person.id}`}
                className="flex items-center gap-4 rounded-md p-3 transition-colors hover:bg-accent"
              >
                <div className="h-16 w-16 flex-shrink-0">
                  <img
                    src={person.profilePath !== null ? `https://image.tmdb.org/t/p/${ProfileSizes.medium}${person.profilePath}` : '/images/no-profile.png'}
                    alt={person.name}
                    loading="lazy"
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">{person.name}</p>
                  <p className="truncate text-muted-foreground">{person.character}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-border bg-card p-6">
          <Kicker className="border-b border-border pb-3">Crew</Kicker>
          <div className="space-y-4">
            {credits.crew.map((person, idx) => (
              <Link
                key={`${person.id}-${idx}`}
                to={`/person/${person.id}`}
                className="flex items-center gap-4 rounded-md p-3 transition-colors hover:bg-accent"
              >
                <div className="h-16 w-16 flex-shrink-0">
                  <img
                    src={person.profilePath !== null ? `https://image.tmdb.org/t/p/${ProfileSizes.medium}${person.profilePath}` : '/images/no-profile.png'}
                    alt={person.name}
                    loading="lazy"
                    className="h-full w-full rounded-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-foreground">{person.name}</p>
                  <p className="truncate text-muted-foreground">{person.job}</p>
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
