import { useParams } from 'react-router-dom';

import { useState } from 'react';

import { assertNonNull } from '@/shared/utils';
import { ListQueries } from '@/stores/queries/listQueries';
import { FilmList, Loader } from '@/shared/components';
import { Type } from '@/shared/enums';

const ListDetailComponent = () => {
  const { id } = useParams<{ id: string; }>();
  const [activeTab, setActiveTab] = useState<Type>(Type.Movie);
  assertNonNull(id);
  const { data, isError, isLoading } = ListQueries.useById(id);

  if (isLoading) {
    return <Loader className="h-withoutNavbar"/>;
  }

  if (isError) {
    return <p>error</p>;
  }

  return (
    <div className="px-8 py-12">
      <h1>{data.name}</h1>
      <p>{data.description}</p>
      <div className="tabs">
        <a className={`tab ${activeTab === Type.Movie ? 'tab-active' : ''}`} onClick={() => setActiveTab(Type.Movie)}>Movies</a>
        <a className={`tab ${activeTab === Type.Tv ? 'tab-active' : ''}`} onClick={() => setActiveTab(Type.Tv)}>Tv Shows</a>
      </div>
      <FilmList data={activeTab === Type.Movie ? data?.movies : data?.tvShows} />
    </div>
  );
};

export const Detail = ListDetailComponent;
