import { memo, FC, useState, useEffect, useRef } from 'react';

import { useParams } from 'react-router-dom';

import { Select } from '../components/Detail/components';

import { API_CONFIG } from '@/api/config';
import { Loader } from '@/shared/components';
import { TvQueries } from '@/stores/queries/tvQueries';
import { assertNonNull } from '@/shared/utils';

const Watch: FC = () => {
    const player = useRef<HTMLDivElement | null>(null);
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
    id !== undefined && season !== -1 && episode !== -1 ?
      `${API_CONFIG.videoApiUrl}tv?id=${id}&s=${season}&e=${episode}` :
      null;

    useEffect(() => {
        setEpisode(1);
    }, [season]);

    useEffect(() => {
        if (player.current !== null) {
          player.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [episode]);

      if (isLoading) {
        return <Loader className="h-withoutNavbar"/>;
    }

      if (isError) {
        return <div>Error: {error.message}</div>;
      }
    return (
      <div className="w-[90%] mx-auto">
        <div className="text-sm breadcrumbs">
          <ul>
            <li><a>Home</a></li>
            <li><a>Tv shows</a></li>
            <li>Watch</li>
          </ul>
        </div>
        {
            videoSource !== null && (
            <div ref={player} className="z-10 ">
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
        <Select
          season={season}
          episode={episode}
          setSeason={setSeason}
          setEpisode={setEpisode}
          tvId={tvId}
          seasons={tv.seasons ?? []}
        />
      </div>
    );
};

export const WatchPage = memo(Watch);
