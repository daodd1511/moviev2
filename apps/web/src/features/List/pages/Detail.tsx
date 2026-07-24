/* eslint-disable max-lines-per-function */
import { Link, useParams, useNavigate } from 'react-router-dom';

import { useState } from 'react';

import { toast } from 'react-toastify';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { assertNonNull } from '@/shared/utils';
import { ListQueries } from '@/stores/queries/listQueries';
import { Footer, Loader, MediaListItem } from '@/shared/components';
import { Type } from '@/shared/enums';
import { Media } from '@/models';
import { ListService } from '@/api/services/listService';
import { UserQueries } from '@/stores/queries/userQueries';
import { MediaType } from '@/shared/enums/mediaType';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const ListDetailComponent = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { id } = useParams<{ id: string; }>();
  const [isConfirmRemoveListModalOpen, setIsConfirmRemoveListModalOpen] =
    useState(false);
  const { data: user, isLoading: isUserLoading } = UserQueries.useProfile();
  const [activeTab, setActiveTab] = useState<Type>(Type.Movie);
  assertNonNull(id);
  const { data, isLoading } = ListQueries.useById(id);

  const removeMediaMutation = useMutation(
    (item: Media) =>
      item.type === MediaType.Movie ?
        ListService.removeMovie(id, item) :
        ListService.removeTv(id, item),
    {
      async onSuccess() {
        await queryClient.invalidateQueries(['listDetail']);
        toast.success('Item removed from list');
      },
    },
  );

  const removeListMutation = useMutation(() => ListService.remove(id), {
    onSuccess() {
      toast.success('List removed');
      navigate('/user/lists');
    },
  });

  const onRemoveMediaButtonClick = (item: Media) => {
    removeMediaMutation.mutate(item);
  };

  const onRemoveListButtonClick = () => {
    setIsConfirmRemoveListModalOpen(true);
  };

  const onConfirmRemoveListButtonClick = () => {
    removeListMutation.mutate();
    setIsConfirmRemoveListModalOpen(false);
  };

  if (isLoading || isUserLoading) {
    return <Loader className="min-h-[60vh]" />;
  }

  return (
    <div className="px-8 py-12">
      <div className="flex justify-between">
        <div>
          <h1>
            {data?.name} (Total:{' '}
            {(data?.movies.length ?? 0) + (data?.tvShows.length ?? 0)})
          </h1>
          <p className="text-muted-foreground">{data?.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            to={`/u/${user.username}/lists/${data?.id ?? ''}`}
            target="_blank"
            className="text-sm text-primary hover:underline"
          >
            Go to public link
          </Link>
          <Button variant="destructive" size="sm" onClick={onRemoveListButtonClick}>
            Remove
          </Button>

          <Dialog open={isConfirmRemoveListModalOpen} onOpenChange={setIsConfirmRemoveListModalOpen}>
            <DialogContent className="sm:max-w-sm">
              <DialogTitle className="text-center">
                Do you want to remove this list?
              </DialogTitle>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsConfirmRemoveListModalOpen(false)}>
                  No
                </Button>
                <Button variant="destructive" onClick={onConfirmRemoveListButtonClick}>
                  Yes
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex gap-4 border-b border-border pb-10">
        <a
          className={`cursor-pointer px-4 py-2 ${activeTab === Type.Movie ? 'border-b-2 border-primary font-semibold text-foreground' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab(Type.Movie)}
        >
          Movies
        </a>
        <a
          className={`cursor-pointer px-4 py-2 ${activeTab === Type.Tv ? 'border-b-2 border-primary font-semibold text-foreground' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab(Type.Tv)}
        >
          Tv Shows
        </a>
      </div>
      <div className="grid grid-cols-autoFit place-content-evenly gap-x-6 gap-y-10 pb-10">
        {activeTab === Type.Movie ?
          data?.movies.map((movie: Media) => (
            <div key={movie.id}>
              <MediaListItem media={movie} />
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => onRemoveMediaButtonClick(movie)}
              >
                Remove
              </Button>
            </div>
          )) :
          data?.tvShows.map((tv: Media) => (
            <div key={tv.id}>
              <MediaListItem media={tv} />
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => onRemoveMediaButtonClick(tv)}
              >
                Remove
              </Button>
            </div>
          ))}
      </div>
      <Footer />
    </div>
  );
};

export const Detail = ListDetailComponent;
