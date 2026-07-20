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
    <div className={`absolute flex flex-col items-end ${className ?? ''} min-w-[200px]`}>
      {isMenuOpen && (
        <div
          className={'relative z-20 rounded-lg bg-white p-2 text-sm w-full flex flex-col items-center gap-2'}
        >
          {!isAuth && <Link to="/auth/login" className="rounded-lg p-2 text-md hover:bg-base-300 w-full text-center">Login</Link>}
          {isAuth && (
            <ul className="w-full">
              <li className="relative">
                <button
                  type="button"
                  onClick={addToListClick}
                  className="p-2 hover:rounded-lg hover:bg-gray-300 w-full"
                >
                  Add to list
                </button>
                {isListMenuOpen && (
                  <div className="absolute top-24 -right-2 w-60 flex flex-col items-center rounded-lg bg-white p-2 shadow-2xl">
                    <Link
                      to="/list/new"
                      className="rounded-lg p-2 text-md hover:bg-base-300 w-full text-center"
                    >
                      Create new list
                    </Link>
                    <ul className='w-full'>
                      {isListLoading ?
                        (
                          <Loader />
                        ) :
                        (
                          <div className="p-2 flex flex-col gap-2 w-full">
                            <p className="font-bold text-center">Add to existing lists</p>

                            {lists?.map(list => (
                              <li key={list.id}>
                                <button
                                  type="button"
                                  className="w-full rounded-lg py-2 hover:bg-base-300"
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
