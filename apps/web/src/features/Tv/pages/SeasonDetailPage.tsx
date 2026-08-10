import { memo } from 'react';
import { useParams } from 'react-router-dom';

import { SeasonDetail } from '../components/SeasonDetail/SeasonDetail';

import { NotFound } from '@/shared/components/NotFound';

const parseRouteNumber = (value: string | undefined, minimum: number): number | null => {
  if (value === undefined || !/^\d+$/.test(value)) {
    return null;
  }

  const number = Number(value);
  return Number.isSafeInteger(number) && number >= minimum ? number : null;
};

const SeasonDetailPageComponent = () => {
  const { id, seasonNumber } = useParams();
  const tvId = parseRouteNumber(id, 1);
  const parsedSeasonNumber = parseRouteNumber(seasonNumber, 0);

  if (tvId === null || parsedSeasonNumber === null) {
    return <NotFound />;
  }

  return <SeasonDetail tvId={tvId} seasonNumber={parsedSeasonNumber} />;
};

export const SeasonDetailPage = memo(SeasonDetailPageComponent);
