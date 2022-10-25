import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { memo, useState } from 'react';

import { Link } from 'react-router-dom';

import { IMAGE_BASE_URL } from '../../../core/constants';
import { PosterSizes } from '../../../core/enums';
import { Movie, Pagination } from '../../../core/models';
import { Spinner } from '../../../shared/components';
import { useDebounce } from '../../../shared/hooks';
import { MovieService } from '../../../api/services/movieService';

const SearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const debounceSearchQuery = useDebounce<string>(searchQuery);
  const { data, isLoading, isError, error } = useQuery<
    Pagination<Movie>,
    AxiosError
  >(['movieSearch', debounceSearchQuery], () => MovieService.searchMovies(debounceSearchQuery), {
    enabled: debounceSearchQuery !== '',
  });
  return (
    <>
      <label
        htmlFor="default-search"
        className="sr-only mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
      >
          Search
      </label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <svg
            aria-hidden="true"
            className="h-5 w-5 text-gray-500 dark:text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            ></path>
          </svg>
        </div>
        <input
          type="search"
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2 pl-10 text-gray-900 "
          placeholder="Search TVs"
          required
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>
      {searchQuery !== '' && (
        <div className="h-80 w-full overflow-auto overflow-x-hidden shadow-xl bg-white rounded-lg">
          {isLoading && <Spinner />}
          {isError && <div>Error: {error.message}</div>}
          {data?.results.map(movie => (
            <Link
              to={`/tv/detail/${movie.id}`}
              key={movie.id}
              className="flex items-center border-b border-gray-200 p-4"
            >
              <img
                src={
                  movie.posterPath !== null ?
                    `${IMAGE_BASE_URL}${PosterSizes.small}${movie.posterPath}` :
                    '/images/no-image.png'
                }
                alt="Movie poster"
                className="h-20 rounded-lg"
              />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {movie.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
};

export const Search = memo(SearchComponent);
