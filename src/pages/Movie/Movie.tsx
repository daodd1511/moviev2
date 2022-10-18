import { memo } from 'react';
import { useParams } from 'react-router-dom';

import { Type } from '../../core/enums';
import { API_CONFIG } from '../../api/config';

interface Props {

  /** Movie type. */
  readonly type: Type;
}

const MovieComponent = ({ type }: Props) => {
  const { id } = useParams();
  const videoSource = id !== undefined ? `${API_CONFIG.videoApiUrl}${type}?id=${id}` : null;
  console.log(videoSource);
  return (
    <>
      <div>Movie detail page</div>
      {videoSource !== null && <iframe src={videoSource} />}
    </>
  );
};

export const Movie = memo(MovieComponent);
