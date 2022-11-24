import { zodResolver } from '@hookform/resolvers/zod';
import { ChangeEvent, memo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { AxiosError } from 'axios';

import { listSchema } from './formSetting';

import { SearchResults } from './components/SearchResults';

import { List } from '@/models';
import { SearchService } from '@/api/services/searchService';
import { MovieSearch, TvSearch } from '@/models/search.model';
import { useDebounce } from '@/shared/hooks';
import { ErrorField } from '@/features/Auth/components/ErrorField';
import { ListService } from '@/api/services/listService';

const CreateNewComponent = () => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<List>({
    resolver: zodResolver(listSchema),
  });

  const [movieList, setMovieList] = useState<readonly MovieSearch[]>([]);
  const [tvList, setTvList] = useState<readonly TvSearch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const debounceSearchQuery = useDebounce<string>(searchQuery);

  const {
    data: searchResults,
    isLoading,
    isError,
    error,
  } = useQuery<Array<MovieSearch | TvSearch>, AxiosError>(
    ['listSearch', debounceSearchQuery],
    () => SearchService.multi(debounceSearchQuery),
    {
      enabled: debounceSearchQuery !== '',
    },
  );

  const addMutation = useMutation((list: List) => ListService.create(list), {
    async onSuccess() {
      await queryClient.invalidateQueries(['lists']);
    },
  });

  const onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleResultClick = (media: MovieSearch | TvSearch) => {
    if (media instanceof MovieSearch) {
      setMovieList([...movieList, media]);
    } else {
      setTvList([...tvList, media]);
    }
    setSearchQuery('');
  };

  const onSubmit = handleSubmit(() => {
    const movies = movieList.map(movie => movie.id);
    const tvShows = tvList.map(tv => tv.id);
    setValue('movies', movies);
    setValue('tvShows', tvShows);
    const list = getValues();
    console.log(list);
    addMutation.mutate(list);
  });
  return (
    <div>
      <form onSubmit={onSubmit} className="max-w-lg">
        <div>
          <label className="label">Name</label>
          <input
            type="text"
            placeholder="Type here"
            className="input input-bordered w-full "
            {...register('name')}
          />
          {errors.name?.message !== undefined && (
            <ErrorField error={errors.name.message} />
          )}
        </div>
        <div className="mt-4">
          <label className="label">Description</label>
          <textarea
            placeholder="Type here"
            className="textarea textarea-bordered w-full"
            {...register('description')}
          />
        </div>
        <div className="mt-4">
          <label className="label">Add movies/tv shows</label>
          <input
            type="text"
            placeholder="Search here"
            className="input input-bordered w-full"
            value={searchQuery}
            onChange={onSearchChange}
          />
          {searchQuery !== '' && searchResults != null && (
            <SearchResults
              searchResults={searchResults}
              handleResultClick={handleResultClick}
            />
          )}
          <div>
            <h2 className="text-xl">Movies</h2>
            {movieList.map((movie, index) => (
              <div key={movie.id}>{index}. {
                  movie.title
              }</div>))}
          </div>
          <div>
            <h2 className="text-xl">Tv Shows</h2>
            {tvList.map((tv, index) => (
              <div key={tv.id}>{index}. {
                  tv.name
              }</div>))}
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button type="submit" className="btn btn-sm">
            Create
          </button>
        </div>
      </form>
    </div>
  );
};

export const CreateNew = memo(CreateNewComponent);
