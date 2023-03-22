/* eslint-disable max-lines-per-function */
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useAtom } from 'jotai';

import { Loader } from '../styles';

import { ListQueries } from '@/stores/queries/listQueries';
import { List, Media } from '@/models';
import { isAuthAtom } from '@/stores/atoms/authAtoms';
import { ListService } from '@/api/services/listService';
import { MediaType } from '@/shared/enums/mediaType';

interface Props {

  /** Media id. */
  readonly media: Media;

  /** Menu open state. */
  readonly isMenuOpen: boolean;

  /** Menu open state setter. */
  readonly setIsMenuOpen: (value: boolean) => void;

  /** Custom class. */
  readonly className?: string;
}

export const Menu = ({
  media,
  isMenuOpen,
  setIsMenuOpen,
  className,
}: Props) => {
  const [isListMenuOpen, setIsListMenuOpen] = useState<boolean>(false);
  const [isAuth] = useAtom(isAuthAtom);
  const { data: lists, isLoading: isListLoading } =
    ListQueries.useAll(isListMenuOpen);

  const addItemToListMutation = useMutation(
    (list: List) => ListService.update(list),
    {
      onSuccess() {
        setIsListMenuOpen(false);
        setIsMenuOpen(false);
        toast.success('Movie added to list');
      },
    },
  );

  const addToListClick = () => {
    setIsListMenuOpen(!isListMenuOpen);
  };

  const onListClick = (list: List) => {
    const isMovie = media.type === MediaType.Movie;
    const existingItem = isMovie ?
      list.movies.find(m => m.id === media.id) :
      list.tvShows.find(t => t.id === media.id);

    if (existingItem !== undefined) {
      toast.error(`${isMovie ? 'Movie' : 'Show'} already in list`);
      return;
    }

    const newList = isMovie ?
      { ...list, movies: [...list.movies, media] } :
      { ...list, tvShows: [...list.tvShows, media] };

    addItemToListMutation.mutate(newList as List);
  };

  const onCloseButtonClick = () => {
    setIsMenuOpen(false);
    setIsListMenuOpen(false);
  };
  return (
    <div className={`absolute flex flex-col items-end ${className ?? ''}`}>
      {isMenuOpen && (
        <div
          className={`relative z-20 rounded-lg bg-white p-2 text-sm ${
            !isAuth ? 'flex flex-col items-center' : ''
          }`}
        >
          {!isAuth && <Link to="/auth/login" className="p-2">Login</Link>}
          {isAuth && (
            <ul>
              <li className="relative">
                <button
                  type="button"
                  onClick={addToListClick}
                  className="p-2 hover:rounded-lg hover:bg-gray-300"
                >
                  Add to list
                </button>
                {isListMenuOpen && (
                  <div className="absolute -top-2 -right-48 flex flex-col items-center rounded-lg bg-base-300 p-2">
                    <Link
                      to="/list/new"
                      className="rounded-lg p-2 text-lg hover:bg-white"
                    >
                      Create new list
                    </Link>
                    <ul>
                      {isListLoading ?
                        (
                          <Loader />
                        ) :
                        (
                          <div className="p-2">
                            <p>Add to existing lists</p>

                            {lists?.map(list => (
                              <li key={list.id}>
                                <button
                                  type="button"
                                  className="w-full rounded-lg py-2 hover:bg-white"
                                  onClick={() => onListClick(list)}
                                >
                                  {list.name}
                                </button>
                              </li>
                            ))}
                          </div>
                        )}
                    </ul>
                  </div>
                )}
              </li>
            </ul>
          )}
          <button
            type="button"
            onClick={onCloseButtonClick}
            className="w-full rounded-lg p-2 hover:bg-error hover:text-white"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};
