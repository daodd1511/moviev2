import { memo, useState } from 'react';
import { List as ListIcon, Play, Star } from 'lucide-react';

import { TvDetail, Video } from '@/models';
import { formatToYear } from '@/shared/utils';
import { MediaMapper } from '@/api/mappers/media.mapper';
import { Menu } from '@/shared/components/List/Menu';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Chip } from '@/shared/components/ui/Chip';

interface Props {

  /** Tv detail. */
  readonly tv: TvDetail;
}

const getTrailerKey = (videos: readonly Video[]) => {
  const trailer = videos.find(video => video.type === 'Trailer');
  return trailer != null ? trailer.key : '';
};

const ContentComponent = ({ tv }: Props) => {
  const [isWatchTrailer, setIsWatchTrailer] = useState(false);

  const trailerKey = getTrailerKey(tv.videos);
  const year = formatToYear(tv.firstAirDate);

  return (
    <div className="relative z-2 pb-3.5">
      <p className="mb-4 text-[0.82rem] font-medium uppercase tracking-[0.2em] text-primary">
        Now Showing
      </p>
      <h1 className="mb-2.5 text-[clamp(2.6rem,6vw,5rem)] font-extralight uppercase leading-[1.02] tracking-[0.015em] text-foreground">
        {tv.name}
      </h1>
      {tv.tagline !== '' && (
        <p className="mb-5 italic text-muted-foreground">{tv.tagline}</p>
      )}
      <p className="mb-7 flex flex-wrap items-center gap-4 text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 font-medium text-primary">
          <Star className="h-4 w-4 fill-current" />
          {tv.voteAverage.toFixed(1)}
        </span>
        <span aria-hidden="true" className="h-1 w-1 rounded-full bg-border" />
        <span>{year}</span>
        <span aria-hidden="true" className="h-1 w-1 rounded-full bg-border" />
        <span>{tv.seasons.length} Season{tv.seasons.length !== 1 ? 's' : ''}</span>
      </p>

      {tv.genres.length > 0 && (
        <ul className="mb-8 flex flex-wrap gap-3">
          {tv.genres.map(({ id, name }) => (
            <li key={id}>
              <Chip>{name}</Chip>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-4">
        {trailerKey !== '' && (
          <Button onClick={() => setIsWatchTrailer(true)}>
            <Play className="h-4 w-4" /> Watch Trailer
          </Button>
        )}
        <Menu
          media={MediaMapper.fromTv(tv)}
          triggerLabel="Add to list"
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/[0.08] text-foreground transition-colors hover:border-white/40 hover:bg-white/[0.16]"
          trigger={<ListIcon className="h-4 w-4" />}
        />
      </div>

      {trailerKey !== '' && (
        <Dialog open={isWatchTrailer} onOpenChange={setIsWatchTrailer}>
          <DialogContent className="w-[80vw] max-w-7xl border-0 bg-transparent p-0 shadow-none ring-0">
            <DialogTitle className="sr-only">{tv.name} trailer</DialogTitle>
            <div className="aspect-video">
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}`}
                title="Trailer"
                className="h-full w-full rounded-md"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export const Content = memo(ContentComponent);
