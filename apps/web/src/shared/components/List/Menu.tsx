import { useState, ReactNode } from 'react';
import { Link } from 'react-router-dom';

import { useAtom } from 'jotai';
import { Bookmark, ListPlus, Plus } from 'lucide-react';

import { Loader } from '../styles';

import { useAddToList } from './useAddToList';

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
import { Media } from '@/models';
import { isAuthAtom } from '@/stores/atoms/authAtoms';

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
  const { data: lists, isPending: isListPending } = ListQueries.useAll(isListMenuOpen);
  const { addToList } = useAddToList(media);

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
          <DropdownMenuSub open={isListMenuOpen} onOpenChange={setIsListMenuOpen}>
            <DropdownMenuSubTrigger onPointerEnter={() => setIsListMenuOpen(true)}>
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
              {isListPending ? (
                <Loader />
              ) : (
                lists?.map(list => (
                  <DropdownMenuItem key={list.id} onClick={() => addToList(list)}>
                    <Bookmark aria-hidden="true" />
                    {list.name}
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
