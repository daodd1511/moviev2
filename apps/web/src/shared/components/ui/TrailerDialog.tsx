import { useState } from 'react';
import { Play, X } from 'lucide-react';

import { Dialog, DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Video } from '@/models';
import { cn } from '@/lib/utils';
import { formatMediumDate } from '@/shared/utils/formatDate';

interface Props {
  /** Dialog visibility. */
  readonly open: boolean;

  /** Visibility change handler. */
  readonly onOpenChange: (open: boolean) => void;

  /** Media title. */
  readonly title: string;

  /** Available YouTube trailers. */
  readonly trailers: readonly Video[];
}

export const TrailerDialog = ({ open, onOpenChange, title, trailers }: Props) => {
  const [selectedTrailerId, setSelectedTrailerId] = useState<string | null>(null);
  const selectedTrailer = trailers.find(trailer => trailer.id === selectedTrailerId) ?? trailers[0];

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      setSelectedTrailerId(null);
    }
    onOpenChange(nextOpen);
  };

  if (selectedTrailer == null) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[calc(100svh-0.5rem)] w-[min(98vw,90rem,160svh)] max-w-none flex-col gap-0 overflow-hidden rounded-lg border border-foreground/10 bg-popover p-0 shadow-[0_28px_80px_-20px_rgba(0,0,0,0.9)] ring-0 sm:max-w-none"
      >
        <header className="flex h-14 shrink-0 items-center gap-4 border-b border-foreground/10 px-4">
          <DialogTitle className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
            {title}
            <span className="font-normal text-muted-foreground"> — {selectedTrailer.name}</span>
          </DialogTitle>
          <DialogClose asChild>
            <button
              type="button"
              aria-label="Close trailers"
              className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.08] hover:text-foreground"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
          </DialogClose>
        </header>

        <div
          className={cn(
            'min-h-0',
            trailers.length > 1 && 'lg:grid lg:grid-cols-[minmax(0,1fr)_20rem]',
          )}
        >
          <div className="aspect-video w-full bg-background">
            <iframe
              key={selectedTrailer.key}
              src={`https://www.youtube.com/embed/${selectedTrailer.key}`}
              title={`${title}: ${selectedTrailer.name}`}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {trailers.length > 1 && (
            <section
              aria-label="Available trailers"
              className="flex max-h-[28svh] min-h-0 flex-col border-t border-foreground/10 lg:max-h-none lg:border-t-0 lg:border-l"
            >
              <p className="shrink-0 px-4 pt-3 pb-2 text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Trailers · {trailers.length}
              </p>
              <div className="grid min-h-0 grid-cols-1 gap-1 overflow-y-auto px-2 pb-2 sm:grid-cols-2 lg:grid-cols-1">
                {trailers.map(trailer => {
                  const isSelected = trailer.id === selectedTrailer.id;

                  return (
                    <button
                      key={trailer.id}
                      type="button"
                      aria-pressed={isSelected}
                      className={cn(
                        'flex min-w-0 items-center gap-3 rounded-md border px-3 py-2.5 text-left transition-colors',
                        isSelected
                          ? 'border-primary/40 bg-primary/10 text-foreground'
                          : 'border-transparent text-muted-foreground hover:bg-foreground/[0.16] hover:text-foreground',
                      )}
                      onClick={() => setSelectedTrailerId(trailer.id)}
                    >
                      <span
                        className={cn(
                          'flex size-8 shrink-0 items-center justify-center rounded-full',
                          isSelected
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-surface text-foreground',
                        )}
                      >
                        <Play className="size-3.5 fill-current" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{trailer.name}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {trailer.official ? 'Official trailer' : 'Trailer'} ·{' '}
                          {formatMediumDate(trailer.publishedAt)}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
