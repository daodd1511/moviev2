import { type ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, FolderPlus, Plus } from 'lucide-react';
import { useAtom } from 'jotai';

import { Loader } from '../styles';
import { useAddToCollection } from './useAddToCollection';

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
import { type Media } from '@/models/media.model';
import { isAuthAtom } from '@/stores/atoms/authAtoms';
import { CollectionQueries } from '@/stores/queries/collectionQueries';

interface CollectionMenuProps {
  readonly media: Media;
  readonly trigger: ReactNode;
  readonly triggerLabel: string;
  readonly className?: string;
}

export const CollectionMenu = ({ media, trigger, triggerLabel, className }: CollectionMenuProps) => {
  const [isCollectionMenuOpen, setIsCollectionMenuOpen] = useState(false);
  const [isAuth] = useAtom(isAuthAtom);
  const { data: collections, isPending } = CollectionQueries.useAll(isCollectionMenuOpen);
  const { addToCollection } = useAddToCollection(media);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger aria-label={triggerLabel} className={className}>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {!isAuth && <DropdownMenuItem asChild><Link to="/auth/login">Login</Link></DropdownMenuItem>}
        {isAuth && (
          <DropdownMenuSub open={isCollectionMenuOpen} onOpenChange={setIsCollectionMenuOpen}>
            <DropdownMenuSubTrigger onPointerEnter={() => setIsCollectionMenuOpen(true)}>
              <FolderPlus aria-hidden="true" /> Add to Collection
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem asChild><Link to="/collections/new"><Plus aria-hidden="true" /> Create Collection</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Your Collections</DropdownMenuLabel>
              {isPending ? <Loader /> : collections?.map(collection => (
                <DropdownMenuItem key={collection.id} onClick={() => addToCollection(collection)}>
                  <Bookmark aria-hidden="true" /> {collection.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
