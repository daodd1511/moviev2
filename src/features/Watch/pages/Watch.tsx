import { memo, FC, useState } from 'react';

import { useParams } from 'react-router-dom';

import { API_CONFIG } from '@/api/config';
import { Loader } from '@/shared/components';
import { TvQueries } from '@/stores/queries/tvQueries';
import { assertNonNull } from '@/shared/utils';

const Watch: FC = () => {
    const { id } = useParams();
    assertNonNull(id, 'TV id is null');
    const tvId = parseInt(id, 10);
    const [season, setSeason] = useState<number>(1);
    const [episode, setEpisode] = useState<number>(1);
      const {
    data: tv,
    isLoading,
    isError,
    error,
      } = TvQueries.useDetail(tvId);
    const videoSource =
    id !== undefined && season !== undefined && episode !== undefined ?
      `${API_CONFIG.videoApiUrl}tv?id=${id}&s=${season}&e=${episode}` :
      null;

      if (isLoading) {
        return <Loader className="h-withoutNavbar"/>;
    }

      if (isError) {
        return <div>Error: {error.message}</div>;
      }
    return (
      <div>
        <h1>Watch</h1>
        <h2>{id}</h2>
        {
            videoSource !== null && (
            <div className="z-10 w-5/6">
              <iframe
                src={videoSource}
                width="100%"
                height="100%"
                allowFullScreen={true}
                className="aspect-video"
              />
            </div>
          )
        }
      </div>
    );
};

export const WatchPage = memo(Watch);
