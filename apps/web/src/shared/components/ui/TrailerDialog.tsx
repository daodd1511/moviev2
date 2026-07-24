import { X } from 'lucide-react';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

interface Props {

  /** Dialog visibility. */
  readonly open: boolean;

  /** Visibility change handler. */
  readonly onOpenChange: (open: boolean) => void;

  /** Media title. */
  readonly title: string;

  /** YouTube video key. */
  readonly trailerKey: string;
}

export const TrailerDialog = ({
  open,
  onOpenChange,
  title,
  trailerKey,
}: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent
      showCloseButton={false}
      className="w-[min(96vw,150vh)] max-w-none gap-0 overflow-hidden rounded-lg border border-foreground/10 bg-popover p-0 shadow-[0_28px_80px_-20px_rgba(0,0,0,0.9)] ring-0 sm:max-w-none"
    >
      <header className="flex h-14 items-center gap-4 border-b border-foreground/10 px-4">
        <DialogTitle className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
          {title} <span className="font-normal text-muted-foreground">— Trailer</span>
        </DialogTitle>
        <DialogClose asChild>
          <button
            type="button"
            aria-label="Close trailer"
            className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.08] hover:text-foreground"
          >
            <X aria-hidden="true" className="size-5" />
          </button>
        </DialogClose>
      </header>
      <div className="aspect-video w-full bg-background">
        <iframe
          src={`https://www.youtube.com/embed/${trailerKey}`}
          title={`${title} trailer`}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </DialogContent>
  </Dialog>
);
