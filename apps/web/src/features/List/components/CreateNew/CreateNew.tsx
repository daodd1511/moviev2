/* eslint-disable max-lines-per-function */
import { zodResolver } from '@hookform/resolvers/zod';
import { ChangeEvent, memo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { AxiosError } from 'axios';

import { toast } from 'react-toastify';

import { listSchema } from './formSetting';

import { SearchResults } from './components/SearchResults';

import { List, Media, Movie, Tv } from '@/models';
import { SearchService } from '@/api/services/searchService';
import { MovieSearch, TvSearch } from '@/models/search.model';
import { useDebounce } from '@/shared/hooks';
import { ErrorField } from '@/features/Auth/components/ErrorField';
import { ListService } from '@/api/services/listService';
import { MediaMapper } from '@/api/mappers/media.mapper';

const CreateNewComponent = () => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm<List>({
    resolver: zodResolver(listSchema),
  });

  const [movieList, setMovieList] = useState<Movie[]>([]);
  const [tvList, setTvList] = useState<Tv[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const debounceSearchQuery = useDebounce<string>(searchQuery);

  const { data: searchResults } = useQuery<
    Array<MovieSearch | TvSearch>,
    AxiosError
  >(
    ['listSearch', debounceSearchQuery],
    () => SearchService.multi(debounceSearchQuery),
    {
      enabled: debounceSearchQuery !== '',
    },
  );

  const addMutation = useMutation((list: List) => ListService.create(list), {
    async onSuccess() {
      await queryClient.invalidateQueries(['lists']);
      toast.success('List created successfully');
      reset();
    },
  });

  const onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleResultClick = (media: Movie | Tv) => {
    if (media instanceof Movie) {
      if (movieList.some(m => m.id === media.id)) {
        toast.error('Movie already added');
        return;
      }
      setMovieList([...movieList, media]);
    } else {
      if (tvList.some(t => t.id === media.id)) {
        toast.error('Tv already added');
        return;
      }
      setTvList([...tvList, media]);
    }
    setSearchQuery('');
  };

  const onSubmit = handleSubmit(() => {
    const movies: Media[] = movieList.map((movie: Movie) =>
      MediaMapper.fromMovie(movie));
    const tvShows: Media[] = tvList.map((tv: Tv) => MediaMapper.fromTv(tv));
    setValue('movies', movies);
    setValue('tvShows', tvShows);
    const list = getValues();
    addMutation.mutate(list);
  });
  return (
    <div>
      <form onSubmit={onSubmit} className="mx-auto max-w-lg" onKeyDown={e => e.key === 'Enter' && e.preventDefault()}>
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
          <div className="my-4">
            <h2 className="text-xl">Movies</h2>
            {movieList.map((movie, index) => (
              <div key={movie.id}>
                {index + 1}. {movie.title}
              </div>
            ))}
          </div>
          <div>
            <h2 className="text-xl">Tv Shows</h2>
            {tvList.map((tv, index) => (
              <div key={tv.id}>
                {index + 1}. {tv.name}
              </div>
            ))}
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
