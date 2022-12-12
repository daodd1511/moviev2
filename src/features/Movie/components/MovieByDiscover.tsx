import { memo, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { Loader } from '@/shared/components';
import { FilmList } from '@/shared/components/';
import { useInfiniteScroll } from '@/shared/hooks/useInfiniteScroll';
import { MovieQueries } from '@/stores/queries/movieQueries';
import { MovieQueryParams } from '@/models/movie/movieQueryParams.model';
import { SortBy, SortOrder } from '@/shared/enums/sort';

const initialMovieParams: MovieQueryParams = {
  sortBy: SortBy.Popularity,
  sortOrder: SortOrder.Desc,
  withGenres: [],
  voteCountGte: 300,
};

const getMovieParamsFromUrl = (searchParams: URLSearchParams): MovieQueryParams => {
  const sortBy = searchParams.get('sortBy') as SortBy ?? initialMovieParams.sortBy;
  const sortOrder = searchParams.get('sortOrder') as SortOrder ?? initialMovieParams.sortOrder;
  const withGenres = searchParams.getAll('withGenres') ?? initialMovieParams.withGenres;
  const voteCountGte = (searchParams.get('voteCountGte') != null) ? Number(searchParams.get('voteCountGte')) : initialMovieParams.voteCountGte;
  return {
    sortBy,
    sortOrder,
    withGenres,
    voteCountGte,
  };
};

const MovieByDiscoverComponent = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [movieQueryParams, setMovieQueryParams] = useState<MovieQueryParams>(
    getMovieParamsFromUrl(searchParams),
  );
  const {
    data,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage,
    isLoading,
    isError,
    error,
  } = MovieQueries.useInfiniteListByDiscover(movieQueryParams);

  const { observerElement } = useInfiniteScroll(
    {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    },
    fetchNextPage,
    hasNextPage,
  );

  useEffect(() => {
    setMovieParamsToUrl(movieQueryParams);
  }, [movieQueryParams]);

  const setMovieParamsToUrl = (params: MovieQueryParams) => {
    const paramsForUrl = {
      sortBy: params.sortBy,
      sortOrder: params.sortOrder,
      withGenres: (params.withGenres !== undefined) ? params.withGenres.join(',') : '',
      voteCountGte: params.voteCountGte !== undefined ? params.voteCountGte.toString() : '',
    };
    const urlSearchParams = new URLSearchParams(paramsForUrl);
    setSearchParams(urlSearchParams);
  };

  const onChangeParamsClick = () => {
    setMovieQueryParams({
      ...movieQueryParams,
      sortBy: SortBy.VoteAverage,
      sortOrder: SortOrder.Desc,
      voteCountGte: 300,
    });
  };

  if (isLoading) {
    return <Loader className="h-withoutNavbar" />;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }
  return (
    <div className="px-8 py-12">
      <button onClick={onChangeParamsClick}>Change Params</button>
      <h1 className="pb-10">Movies</h1>
      {data.pages.map((moviePage, i) => (
        <FilmList key={i} data={moviePage.results} />
      ))}
      <div className="loader" ref={observerElement}>
        {hasNextPage !== undefined && isFetchingNextPage && <Loader />}
      </div>
    </div>
  );
};

export const MovieByDiscover = memo(MovieByDiscoverComponent);
