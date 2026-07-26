import { memo, FC, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { PersonQueries } from '@/stores/queries/personQueries';
import { Footer } from '@/shared/components/Footer';
import { Loader } from '@/shared/components';
import { NotFound } from '@/shared/components/NotFound';
import { MediaList } from '@/shared/components/List/MediaList';
import { IMAGE_BASE_URL } from '@/shared/constants';
import { ProfileSizes } from '@/shared/enums';
import { CombinedCredit, Media, PersonCombinedCredits } from '@/models';
import { Button } from '@/components/ui/button';

const KNOWN_FOR_LIMIT = 12;
const FILMOGRAPHY_PAGE_SIZE = 24;
const MIN_KNOWN_FOR_VOTES = 100;
const LOW_SIGNAL_GENRE_IDS = new Set([10763, 10764, 10767]);
const SELF_APPEARANCE_PATTERN = /\b(?:self|himself|herself|themselves|archive footage)\b/i;

type CreditDepartment = 'cast' | 'crew';
type MediaTypeFilter = 'all' | 'movie' | 'tv';

const toMedia = (credit: CombinedCredit): Media =>
  new Media({
    id: credit.id,
    type: credit.mediaType === 'movie' ? 'movie' : 'tv',
    title: credit.title || credit.name,
    releaseDate: credit.mediaType === 'movie' ? credit.releaseDate : credit.firstAirDate,
    voteAverage: credit.voteAverage || 0,
    posterPath: credit.posterPath,
  });

const getCreditKey = (credit: CombinedCredit): string => `${credit.mediaType}:${credit.id}`;

const deduplicateCredits = (credits: readonly CombinedCredit[]): readonly CombinedCredit[] => {
  const uniqueCredits = new Map<string, CombinedCredit>();

  credits.forEach(credit => {
    const key = getCreditKey(credit);
    const existingCredit = uniqueCredits.get(key);

    if (existingCredit == null || credit.popularity > existingCredit.popularity) {
      uniqueCredits.set(key, credit);
    }
  });

  return [...uniqueCredits.values()];
};

const isSubstantiveActingCredit = (credit: CombinedCredit): boolean =>
  credit.character.trim().length > 0 &&
  !SELF_APPEARANCE_PATTERN.test(credit.character) &&
  !credit.genreIds.some(genreId => LOW_SIGNAL_GENRE_IDS.has(genreId)) &&
  credit.voteCount >= MIN_KNOWN_FOR_VOTES &&
  credit.posterPath != null;

const getKnownForScore = (credit: CombinedCredit): number => {
  const audienceReach = Math.log10(credit.voteCount + 1) * 30;
  const currentInterest = Math.min(credit.popularity, 100);
  const billingWeight = credit.order == null ? 0 : Math.max(0, 12 - credit.order) * 4;

  return audienceReach + currentInterest + billingWeight;
};

const sortKnownFor = (credits: readonly CombinedCredit[]): readonly CombinedCredit[] =>
  [...credits].sort(
    (a, b) => getKnownForScore(b) - getKnownForScore(a) || b.voteCount - a.voteCount,
  );

const getKnownFor = (
  credits: PersonCombinedCredits,
  knownForDepartment: string,
): readonly Media[] => {
  const isActingDepartment = knownForDepartment === 'Acting';
  const departmentCredits =
    isActingDepartment || credits.crew.length === 0 ? credits.cast : credits.crew;
  const uniqueCredits = deduplicateCredits(departmentCredits);
  const preferredCredits = isActingDepartment
    ? uniqueCredits.filter(isSubstantiveActingCredit)
    : uniqueCredits.filter(
        credit => credit.voteCount >= MIN_KNOWN_FOR_VOTES && credit.posterPath != null,
      );
  const knownForCredits = preferredCredits.length > 0 ? preferredCredits : uniqueCredits;

  return sortKnownFor(knownForCredits).slice(0, KNOWN_FOR_LIMIT).map(toMedia);
};

const getFilmography = (
  credits: PersonCombinedCredits,
  department: CreditDepartment,
  mediaType: MediaTypeFilter,
): readonly Media[] =>
  [...deduplicateCredits(credits[department])]
    .filter(credit => mediaType === 'all' || credit.mediaType === mediaType)
    .sort((a, b) => {
      const aDate = a.mediaType === 'movie' ? a.releaseDate : a.firstAirDate;
      const bDate = b.mediaType === 'movie' ? b.releaseDate : b.firstAirDate;

      return bDate.localeCompare(aDate);
    })
    .map(toMedia);

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
  const [selectedDepartment, setSelectedDepartment] = useState<CreditDepartment | null>(null);
  const [mediaTypeFilter, setMediaTypeFilter] = useState<MediaTypeFilter>('all');
  const [visibleFilmographyCount, setVisibleFilmographyCount] = useState(FILMOGRAPHY_PAGE_SIZE);

  if (isDetailLoading || isCreditsLoading) {
    return <Loader className="min-h-[60vh]" />;
  }

  if (isDetailError || isCreditsError || !personDetail) {
    return <NotFound />;
  }

  const knownFor = getKnownFor(personCredits, personDetail.knownForDepartment);
  const creditDepartment =
    selectedDepartment ??
    (personDetail.knownForDepartment === 'Acting' || personCredits.crew.length === 0
      ? 'cast'
      : 'crew');
  const filmography = getFilmography(personCredits, creditDepartment, mediaTypeFilter);
  const visibleFilmography = filmography.slice(0, visibleFilmographyCount);
  const hasMoreFilmography = visibleFilmography.length < filmography.length;
  const remainingFilmographyCount = filmography.length - visibleFilmography.length;

  const handleDepartmentChange = (department: CreditDepartment) => {
    setSelectedDepartment(department);
    setVisibleFilmographyCount(FILMOGRAPHY_PAGE_SIZE);
  };

  const handleMediaTypeChange = (mediaType: MediaTypeFilter) => {
    setMediaTypeFilter(mediaType);
    setVisibleFilmographyCount(FILMOGRAPHY_PAGE_SIZE);
  };

  const handleShowMoreFilmography = () => {
    setVisibleFilmographyCount(count => count + FILMOGRAPHY_PAGE_SIZE);
  };

  const imageUrl =
    personDetail.profilePath != null
      ? `${IMAGE_BASE_URL}${ProfileSizes.original}${String(personDetail.profilePath)}`
      : '/images/no-profile.png';

  // Format birthday
  const formattedBirthday =
    personDetail.birthday != null
      ? new Date(personDetail.birthday).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : null;

  // Format deathday
  const formattedDeathday =
    personDetail.deathday != null
      ? new Date(personDetail.deathday).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : null;

  // Limit biography length if too long
  const isLongBiography = personDetail.biography != null && personDetail.biography.length > 300;
  const displayBiography = showFullBiography
    ? personDetail.biography
    : isLongBiography
      ? `${personDetail.biography?.substring(0, 300)}...`
      : personDetail.biography;

  return (
    <div className="px-4 py-7 md:p-10">
      <div className="mb-5 hidden text-sm md:block">
        <ul className="flex flex-wrap items-center gap-2 [&>li:not(:first-child)]:before:mr-2 [&>li:not(:first-child)]:before:text-muted-foreground [&>li:not(:first-child)]:before:content-['/']">
          <li>
            <Link to="/" className="text-primary hover:underline">
              Home
            </Link>
          </li>
          <li className="text-muted-foreground">Person</li>
          <li className="text-muted-foreground">{personDetail.name}</li>
        </ul>
      </div>

      <div className="flex flex-col items-start gap-6 md:flex-row md:gap-4">
        {/* Image section */}
        <div className="flex w-full shrink-0 justify-center self-start md:block md:w-1/3">
          <img
            src={imageUrl}
            alt={`${personDetail.name} profile`}
            className="aspect-2/3 w-40 rounded-lg object-cover shadow-lg sm:w-48 md:w-full md:max-w-xs"
          />
        </div>

        {/* Info section - matches height with image */}
        <div className="w-full md:w-2/3">
          <h1 className="mb-5 text-center text-3xl font-semibold text-foreground md:mb-4 md:text-left md:font-bold">
            {personDetail.name}
          </h1>

          <div className="mb-7 grid grid-cols-2 gap-x-4 gap-y-5 rounded-lg border border-border bg-surface/60 p-4 md:mb-6 md:rounded-none md:border-0 md:bg-transparent md:p-0">
            {formattedBirthday && (
              <div>
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Born
                </h3>
                <p className="mt-1 text-sm text-foreground md:text-base">{formattedBirthday}</p>
              </div>
            )}
            {formattedDeathday && (
              <div>
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Died
                </h3>
                <p className="mt-1 text-sm text-foreground md:text-base">{formattedDeathday}</p>
              </div>
            )}
            {personDetail.place_of_birth && (
              <div className="col-span-2 md:col-span-1">
                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Place of Birth
                </h3>
                <p className="mt-1 text-sm text-foreground md:text-base">
                  {personDetail.place_of_birth}
                </p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="mb-2 font-semibold text-muted-foreground">Biography</h3>
            <p className="leading-7 whitespace-pre-line text-foreground">{displayBiography}</p>
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

      <section className="mt-12 border-t border-border pt-7 md:mt-14 md:pt-8">
        <div className="mb-6">
          <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
            Essential viewing
          </p>
          <h2 className="text-2xl font-bold">Known For</h2>
        </div>
        <MediaList data={knownFor} />
      </section>

      <section className="mt-8 border-t border-border pt-7 md:mt-10 md:pt-8">
        <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-primary uppercase">
              Complete credits
            </p>
            <h2 className="text-2xl font-bold">Filmography</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Showing {visibleFilmography.length} of {filmography.length} titles
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div
              role="group"
              aria-label="Credit department"
              className="flex rounded-lg border border-border bg-surface p-1"
            >
              {(['cast', 'crew'] as const).map(department => (
                <button
                  key={department}
                  type="button"
                  aria-pressed={creditDepartment === department}
                  onClick={() => handleDepartmentChange(department)}
                  className="min-h-9 flex-1 rounded-md px-4 text-sm font-medium text-muted-foreground capitalize transition-colors hover:text-foreground aria-pressed:bg-surface-raised aria-pressed:text-primary sm:flex-none"
                >
                  {department}
                </button>
              ))}
            </div>

            <div
              role="group"
              aria-label="Media type"
              className="flex rounded-lg border border-border bg-surface p-1"
            >
              {(['all', 'movie', 'tv'] as const).map(mediaType => (
                <button
                  key={mediaType}
                  type="button"
                  aria-pressed={mediaTypeFilter === mediaType}
                  onClick={() => handleMediaTypeChange(mediaType)}
                  className="min-h-9 flex-1 rounded-md px-4 text-sm font-medium text-muted-foreground capitalize transition-colors hover:text-foreground aria-pressed:bg-surface-raised aria-pressed:text-primary sm:flex-none"
                >
                  {mediaType === 'all' ? 'All' : mediaType}
                </button>
              ))}
            </div>
          </div>
        </div>

        <MediaList data={visibleFilmography} />

        {hasMoreFilmography && (
          <div className="-mt-2 flex justify-center pb-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={handleShowMoreFilmography}
              className="h-11 min-w-44 border-primary/40 px-6 text-primary hover:border-primary/70 hover:bg-primary/10"
            >
              Show {Math.min(FILMOGRAPHY_PAGE_SIZE, remainingFilmographyCount)} more
            </Button>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export const PersonPage = memo(PersonComponent);
