import { Link, useParams } from 'react-router-dom';

import { useState } from 'react';

import { toast } from 'react-toastify';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { assertNonNull } from '@/shared/utils';
import { ListQueries } from '@/stores/queries/listQueries';
import {
  Footer,
  Loader,
  MediaListItem,
} from '@/shared/components';
import { Type } from '@/shared/enums';
import { Media, Movie, Tv } from '@/models';
import { ListService } from '@/api/services/listService';
import { UserQueries } from '@/stores/queries/userQueries';

const ListDetailComponent = () => {
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string; }>();
  const { data: user, isLoading: isUserLoading } = UserQueries.useProfile();
  const [activeTab, setActiveTab] = useState<Type>(Type.Movie);
  assertNonNull(id);
  const { data, isLoading } = ListQueries.useById(id);

  const removeMutation = useMutation(
    (item: Movie | Tv) =>
      item instanceof Movie ?
        ListService.removeMovie(id, item) :
        ListService.removeTv(id, item),
    {
      async onSuccess() {
        await queryClient.invalidateQueries(['listDetail']);
        toast.success('Item removed from list');
      },
    },
  );

  const onRemoveButtonClick = (item: Movie | Tv) => {
    removeMutation.mutate(item);
  };

  if (isLoading || isUserLoading) {
    return <Loader className="h-withoutNavbar" />;
  }

  return (
    <div className="px-8 py-12">
      <div className="flex justify-between">
        <div>
          <h1>{data?.name}</h1>
          <p>{data?.description}</p>
        </div>
        {/* eslint-disable-next-line @typescript-eslint/restrict-template-expressions */}
        <Link to={`/u/${user.username}/lists/${data?.id ?? ''}`} target="_blank">Go to public link</Link>
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

                // onClick={() => onRemoveButtonClick(movie)}
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

                // onClick={() => onRemoveButtonClick(tv)}
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
