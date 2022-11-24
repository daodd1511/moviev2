import { zodResolver } from '@hookform/resolvers/zod';
import { ChangeEvent, memo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useQuery } from '@tanstack/react-query';

import { AxiosError } from 'axios';

import { listSchema } from './formSetting';

import { SearchResults } from './components/SearchResults';

import { List } from '@/models';
import { SearchService } from '@/api/services/searchService';
import { MovieSearch, TvSearch } from '@/models/search.model';
import { useDebounce } from '@/shared/hooks';
import { ErrorField } from '@/features/Auth/components/ErrorField';

const CreateNewComponent = () => {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<List>({
    resolver: zodResolver(listSchema),
  });

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

  const onSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const onSubmit = handleSubmit((listData: List) => {
    console.log(listData);
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
          {(errors.name?.message !== undefined) && <ErrorField error={errors.name.message} />}
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
          {searchQuery !== '' &&
            searchResults != null &&
            <SearchResults searchResults={searchResults} getValues={getValues} setValue={setValue}/>}
          <div {...register('movies')}>
            <h2>Movies</h2>
            {getValues('movies')?.map((movie, index) => (
              <div key={movie}>
                <span>{index}</span>
                <span>{movie}</span>
              </div>
            ))}
          </div>
          <div {...register('tvShows')}>
            <h2>Tv Shows</h2>
            {getValues('tvShows')?.map((tv, index) => (
              <div key={tv}>
                <span>{index}</span>
                <span>{tv}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button type="submit" className="btn btn-sm">Create</button>
        </div>
      </form>
    </div>
  );
};

export const CreateNew = memo(CreateNewComponent);
