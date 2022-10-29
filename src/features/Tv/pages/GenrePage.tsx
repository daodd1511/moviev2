import { FC, memo } from 'react';

import { TvByGenre } from '../components/';

const GenrePageComponent: FC = () => <TvByGenre />;

export const GenrePage = memo(GenrePageComponent);
