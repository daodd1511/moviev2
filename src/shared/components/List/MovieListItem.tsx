import { memo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';

import { useMutation } from '@tanstack/react-query';

import { toast } from 'react-toastify';

import { IMAGE_BASE_URL } from '../../constants';
import { PosterSizes } from '../../enums';
import { formatToYear } from '../../utils';

import { Loader } from '../styles';

import { List, Movie } from '@/models';
import { ListQueries } from '@/stores/queries/listQueries';

interface Props {

  /** Movie data. */
  readonly movie: Movie;
}

const MovieListItemComponent = ({ movie }: Props) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isListMenuOpen, setIsListMenuOpen] = useState<boolean>(false);
  const imageURL =
    movie.posterPath != null ?
      `${IMAGE_BASE_URL}${PosterSizes.large}${movie.posterPath}` :
      '/images/no-image.png';
  const { data: lists, isLoading: isListLoading } = ListQueries.useAll();

  const addItemToListMutation = useMutation(
    (list: List) => ListQueries.update(list),
    {
      onSuccess() {
        setIsListMenuOpen(false);
        setIsMenuOpen(false);
        toast.success('Movie added to list');
      },
    },
  );
  const onItemMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      setIsListMenuOpen(false);
    }
  };

  const addToListClick = () => {
    setIsListMenuOpen(!isListMenuOpen);
  };

  const onListClick = (list: List) => {
    if (list.movies.find(m => m.id === movie.id) != null) {
      toast.error('Movie already in list');
      return;
    }
    const newList = {
      ...list,
      movies: [...list.movies, movie],
    };
    addItemToListMutation.mutate(newList as List);
  };
  return (
    <div className="relative">
      <Link
        to={`/movie/detail/${movie.id}`}
        className="group block h-fit pb-4 transition-all hover:text-white"
      >
        <img
          src={imageURL}
          alt={`${movie.title} image`}
          className="rounded-lg shadow-2xl group-hover:rounded-bl-none group-hover:rounded-br-none"
        />
        <div className="pb-4  group-hover:rounded-b-lg group-hover:bg-slate-700">
          <p className="text-md p-2 pb-4 text-center">{movie.title}</p>
          <div className="flex justify-evenly">
            <div className="flex items-center rounded-lg border border-gray-300 px-2 py-1 text-center text-sm">
              {formatToYear(movie.releaseDate)}
            </div>
            <div className="ml-2 rounded-lg border border-gray-300 p-2 text-center text-sm">
              {movie.voteAverage.toFixed(1)}
            </div>
          </div>
        </div>
      </Link>
      <div className="absolute top-2 right-2 flex flex-col items-end">
        <button
          type="button"
          className="  flex h-5 w-5 items-center justify-center rounded-full bg-slate-500"
          onClick={onItemMenuClick}
        >
          <FontAwesomeIcon icon={faEllipsis} className="text-white" />
        </button>
        {isMenuOpen && (
          <div className="z-20 h-40 w-20 bg-white">
            <ul>
              <li className="relative">
                <button type="button" onClick={addToListClick}>
                  Add to list
                </button>
                {isListMenuOpen && (
                  <div className="absolute -right-40 w-40 bg-red-400">
                    <Link to="/list/new">Create new list</Link>
                    <ul>
                      {isListLoading ?
                        (
                          <Loader />
                        ) :
                        (
                        lists?.map(list => (
                          <li key={list.id}>
                            <button
                              type="button"
                              className="w-full"
                              onClick={() => onListClick(list)}
                            >
                              {list.name}
                            </button>
                          </li>
                        ))
                        )}
                    </ul>
                  </div>
                )}
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export const MovieListItem = memo(MovieListItemComponent);
