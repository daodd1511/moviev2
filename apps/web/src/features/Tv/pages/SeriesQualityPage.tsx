import { memo } from 'react';
import { useParams } from 'react-router-dom';

import { SeriesQuality } from '../components/SeriesQuality/SeriesQuality';

import { NotFound } from '@/shared/components/NotFound';

const parseTvId = (value: string | undefined): number | null => {
  if (value === undefined || !/^\d+$/.test(value)) {
    return null;
  }

  const tvId = Number(value);
  return Number.isSafeInteger(tvId) && tvId > 0 ? tvId : null;
};

const SeriesQualityPageComponent = () => {
  const { id } = useParams();
  const tvId = parseTvId(id);

  if (tvId === null) {
    return <NotFound />;
  }

  return <SeriesQuality tvId={tvId} />;
};

export const SeriesQualityPage = memo(SeriesQualityPageComponent);
