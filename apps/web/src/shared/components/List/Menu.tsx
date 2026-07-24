import { useMutation } from '@tanstack/react-query';
import { useState, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import { useAtom } from 'jotai';
import { Bookmark, ListPlus, Plus } from 'lucide-react';

import { Loader } from '../styles';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ListQueries } from '@/stores/queries/listQueries';
import { List, Media } from '@/models';
import { isAuthAtom } from '@/stores/atoms/authAtoms';
import { ListService } from '@/api/services/listService';
import { MediaType } from '@/shared/enums/mediaType';

interface Props {

  /** Media id. */
  readonly media: Media;

  /** Trigger button content (icon). */
  readonly trigger: ReactNode;

  /** Trigger accessible name. */
  readonly triggerLabel: string;

  /** Custom class for the trigger button. */
  readonly className?: string;
}

export const Menu = ({ media, trigger, triggerLabel, className }: Props) => {
  const [isListMenuOpen, setIsListMenuOpen] = useState<boolean>(false);
  const [isAuth] = useAtom(isAuthAtom);
  const { data: lists, isLoading: isListLoading } =
    ListQueries.useAll(isListMenuOpen);

  const addItemToListMutation = useMutation(
    (list: List) => ListService.update(list),
    {
      onSuccess() {
        toast.success('Movie added to list');
      },
    },
  );

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label={triggerLabel} className={className}>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!isAuth && (
          <DropdownMenuItem asChild>
            <Link to="/auth/login">Login</Link>
          </DropdownMenuItem>
        )}
        {isAuth && (
          <DropdownMenuSub
            open={isListMenuOpen}
            onOpenChange={setIsListMenuOpen}
          >
            <DropdownMenuSubTrigger
              onPointerEnter={() => setIsListMenuOpen(true)}
            >
              <ListPlus aria-hidden="true" />
              Add to list
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem asChild>
                <Link to="/list/new">
                  <Plus aria-hidden="true" />
                  Create new list
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Your lists</DropdownMenuLabel>
              {isListLoading ?
                <Loader /> :
                lists?.map(list => (
                  <DropdownMenuItem key={list.id} onClick={() => onListClick(list)}>
                    <Bookmark aria-hidden="true" />
                    {list.name}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
