
import { memo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Movie, Tv } from '@/models';
import { Loader, MovieListItem, TvListItem, Footer } from '@/shared/components';
import { Type } from '@/shared/enums';
import { assertNonNull } from '@/shared/utils';
import { ListQueries } from '@/stores/queries/listQueries';

const PublicListComponent = () => {
  const { username, listId } = useParams();
  const [activeTab, setActiveTab] = useState<Type>(Type.Movie);
  assertNonNull(username);
  assertNonNull(listId);
  const { data, isLoading } = ListQueries.usePublicList(username, listId);

  if (isLoading) {
    return <Loader className="h-withoutNavbar" />;
  }

  return (
    <div className="px-8 py-12">
      <h1>{data?.name}</h1>
      <p>{data?.description}</p>
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
          data?.movies.map((movie: Movie) => (
            <div key={movie.id}>
              <MovieListItem movie={movie} />
            </div>
          )) :
          data?.tvShows.map((tv: Tv) => (
            <div key={tv.id}>
              <TvListItem tv={tv} />
            </div>
          ))}
      </div>
      <Footer />
    </div>
  );
};

export const PublicList = memo(PublicListComponent);
