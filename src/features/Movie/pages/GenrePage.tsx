import { FC, memo } from 'react';

import { MovieByGenre } from '../components/';

const GenrePageComponent: FC = () => <MovieByGenre />;

export const GenrePage = memo(GenrePageComponent);
