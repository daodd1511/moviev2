import { memo } from 'react';

const MoviesComponent = () => {
  const header = 'Movies';
  return (
    <div>
      <h1 className="text-2xl text-red-500">{header}</h1>
    </div>
  );
};

export const Movies = memo(MoviesComponent);
