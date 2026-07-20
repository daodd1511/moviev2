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
import { Modal } from '@/shared/components/Modal';

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
    return <Loader className="h-withoutNavbar" />;
  }

  return (
    <div className="px-8 py-12">
      <div className="flex justify-between">
        <div>
          <h1>
            {data?.name} (Total:{' '}
            {(data?.movies.length ?? 0) + (data?.tvShows.length ?? 0)})
          </h1>
          <p>{data?.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            to={`/u/${user.username}/lists/${data?.id ?? ''}`}
            target="_blank"
          >
            Go to public link
          </Link>
          <button
            type="button"
            className="btn btn-outline btn-error btn-sm"
            onClick={onRemoveListButtonClick}
          >
            Remove
          </button>

          {isConfirmRemoveListModalOpen && (
            <Modal setIsOpen={setIsConfirmRemoveListModalOpen}>
              <div className="card w-100 bg-base-100 text-neutral-content">
                <div className="card-body items-center text-center text-black">
                  <h2 className="card-title p-6">
                    Do you want to remove this list?
                  </h2>
                  <div className="card-actions">
                    <button
                      type="button"
                      className="btn btn-outline btn-primary"
                      onClick={() => setIsConfirmRemoveListModalOpen(false)}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline btn-error "
                      onClick={onConfirmRemoveListButtonClick}
                    >
                      Yes
                    </button>
                  </div>
                </div>
              </div>
            </Modal>
          )}
        </div>
      </div>
      <div className="tabs pb-10">
        <a
          className={`tab ${activeTab === Type.Movie ? 'tab-active' : ''}`}
          onClick={() => setActiveTab(Type.Movie)}
        >
          Movies
        </a>
        <a
          className={`tab ${activeTab === Type.Tv ? 'tab-active' : ''}`}
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
              <button
                type="button"
                className="btn btn-outline btn-error btn-sm w-full"
                onClick={() => onRemoveMediaButtonClick(movie)}
              >
                  Remove
              </button>
            </div>
          )) :
          data?.tvShows.map((tv: Media) => (
            <div key={tv.id}>
              <MediaListItem media={tv} />
              <button
                type="button"
                className="btn btn-outline btn-error btn-sm w-full"
                onClick={() => onRemoveMediaButtonClick(tv)}
              >
                  Remove
              </button>
            </div>
          ))}
      </div>
      <Footer />
    </div>
  );
};

export const Detail = ListDetailComponent;
