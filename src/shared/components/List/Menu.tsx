import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import { Loader } from '../styles';

import { ListQueries } from '@/stores/queries/listQueries';
import { List, Movie, Tv } from '@/models';

interface Props {

  /** Media id. */
  readonly media: Movie | Tv;
}

export const Menu = ({ media }: Props) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isListMenuOpen, setIsListMenuOpen] = useState<boolean>(false);
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
    if (media instanceof Movie) {
      if (list.movies.find(m => m.id === media.id) != null) {
        toast.error('Movie already in list');
        return;
      }
      const newList = {
        ...list,
        movies: [...list.movies, media],
      };
      addItemToListMutation.mutate(newList as List);
    } else {
      if (list.tvShows.find(t => t.id === media.id) != null) {
        toast.error('Tv already in list');
        return;
      }
      const newList = {
        ...list,
        tvShows: [...list.tvShows, media],
      };
      addItemToListMutation.mutate(newList as List);
    }
  };

  const onCloseButtonClick = () => {
    setIsMenuOpen(false);
    setIsListMenuOpen(false);
  };
  return (
    <div className="absolute top-2 right-2 flex flex-col items-end">
      <button
        type="button"
        className="  flex h-5 w-5 items-center justify-center rounded-full bg-slate-500"
        onClick={onItemMenuClick}
      >
        <FontAwesomeIcon icon={faEllipsis} className="text-white" />
      </button>
      {isMenuOpen && (
        <div className="z-20 h-40 w-20 bg-white relative">
          <ul>
            <li className="relative">
              <button type="button" onClick={addToListClick}>
                Add to list
              </button>
              {isListMenuOpen && (
                <div className="absolute top-0 -right-40 w-40 bg-red-400 flex flex-col items-center">
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
          <button type="button" onClick={onCloseButtonClick} className="absolute bottom-0 w-full">Close</button>
        </div>
      )}
    </div>
  );
};
