import { memo } from 'react';

import { UseFormSetValue, UseFormGetValues } from 'react-hook-form';

import { toast } from 'react-toastify';

import { MovieSearch, TvSearch } from '@/models/search.model';
import { IMAGE_BASE_URL } from '@/shared/constants';
import { PosterSizes, Type } from '@/shared/enums';
import { List } from '@/models';

interface Props {

  /** Search result. */
  readonly searchResults: Array<MovieSearch | TvSearch>;

  /** Set value. */
  readonly setValue: UseFormSetValue<List>;

  /** Get value. */
  readonly getValues: UseFormGetValues<List>;
}

const SearchResultsComponent = ({
  searchResults,
  setValue,
  getValues,
}: Props) => {
  const onResultClick = (mediaType: string, mediaId: number) => {
    if (mediaType === Type.Movie) {
        const oldList = getValues('movies');
        if (oldList !== undefined && oldList.length > 0) {
          if (oldList.includes(mediaId)) {
              toast.error('This movie show is already in the list', {
                  autoClose: 2000,
              });
            return;
          }
          setValue('movies', [...oldList, mediaId]);
        } else {
          setValue('movies', [mediaId]);
        }
    } else if (mediaType === Type.Tv) {
      const oldList = getValues('tvShows');
      if (oldList !== undefined && oldList.length > 0) {
        if (oldList.includes(mediaId)) {
            toast.error('This tv show is already in the list', {
                autoClose: 2000,
            });
          return;
        }
        setValue('tvShows', [...oldList, mediaId]);
      } else {
        setValue('tvShows', [mediaId]);
      }
    }
  };

  return (
    <div className="h-80 overflow-auto rounded-md border border-gray-300 pt-2">
      {searchResults.length === 0 && (
        <p className="text-center">No data found</p>
      )}
      {searchResults.map(result => (
        <button
          key={result.id}
          className="flex w-full items-center border-b border-gray-200 p-4"
          onClick={() => onResultClick(result.mediaType, result.id)}
        >
          <img
            src={
              result.posterPath !== null ?
                `${IMAGE_BASE_URL}${PosterSizes.small}${result.posterPath}` :
                '/images/no-image.png'
            }
            alt="item poster"
            className="h-20 rounded-lg"
          />
          <div className="ml-4 mr-2">
            <h3 className="text-lg font-medium text-gray-900">
              {result instanceof MovieSearch ? result.title : result.name}
            </h3>
          </div>
          <span
            className={`badge ${
              result.mediaType === Type.Movie ?
                'badge-primary' :
                'badge-secondary'
            }`}
          >
            {result.mediaType}
          </span>
        </button>
      ))}
    </div>
  );
};

export const SearchResults = memo(SearchResultsComponent);
