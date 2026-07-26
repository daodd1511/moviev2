import { Link, useParams, useNavigate } from 'react-router-dom';

import { useState } from 'react';

import { toast } from 'react-toastify';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { AlertTriangle, ExternalLink, Star, X } from 'lucide-react';

import { assertNonNull, formatToYear } from '@/shared/utils';
import { ListQueries } from '@/stores/queries/listQueries';
import { Footer, Loader } from '@/shared/components';
import { Type, PosterSizes } from '@/shared/enums';
import { Media } from '@/models';
import { ListService } from '@/api/services/listService';
import { UserQueries } from '@/stores/queries/userQueries';
import { MediaType } from '@/shared/enums/mediaType';
import { Button } from '@/components/ui/button';
import { PosterPlate } from '@/shared/components/ui/PosterPlate';
import { IMAGE_BASE_URL } from '@/shared/constants';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';

interface RemovableItemProps {
  /** Media item. */
  readonly media: Media;

  /** Remove handler. */
  readonly onRemove: (media: Media) => void;
}

const RemovableItem = ({ media, onRemove }: RemovableItemProps) => {
  const imageUrl =
    media.posterPath != null
      ? `${IMAGE_BASE_URL}${PosterSizes.large}${media.posterPath}`
      : '/images/no-image.png';

  return (
    <div className="group relative">
      <Link to={`/${media.type}/${media.id}`} className="block">
        <PosterPlate src={imageUrl} alt={`${media.title} poster`} loading="lazy" />
      </Link>
      <button
        type="button"
        aria-label={`Remove ${media.title} from this list`}
        className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/70 text-foreground opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground focus-visible:opacity-100 [@media(hover:none)]:opacity-100"
        onClick={() => onRemove(media)}
      >
        <X className="h-4 w-4" />
      </button>
      <div className="mt-2">
        <p className="truncate text-sm font-medium text-foreground">{media.title}</p>
        <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatToYear(media.releaseDate)}</span>
          <span className="inline-flex items-center gap-0.5 text-primary">
            <Star className="h-3 w-3 fill-current" />
            {media.voteAverage.toFixed(1)}
          </span>
        </p>
      </div>
    </div>
  );
};

const EmptyState = ({ label }: { label: string }) => (
  <p className="py-16 text-center text-muted-foreground">{label}</p>
);

const ListDetailComponent = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { id } = useParams<{ id: string }>();
  const [isConfirmRemoveListModalOpen, setIsConfirmRemoveListModalOpen] = useState(false);
  const { data: user, isPending: isUserPending } = UserQueries.useProfile();
  const [activeTab, setActiveTab] = useState<Type>(Type.Movie);
  assertNonNull(id);
  const { data, isPending } = ListQueries.useById(id);

  const removeMediaMutation = useMutation({
    mutationFn: (item: Media) =>
      item.type === MediaType.Movie
        ? ListService.removeMovie(id, item)
        : ListService.removeTv(id, item),
    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ['listDetail'] });
      toast.success('Item removed from list');
    },
  });

  const removeListMutation = useMutation({
    mutationFn: () => ListService.remove(id),
    onSuccess() {
      setIsConfirmRemoveListModalOpen(false);
      toast.success('List removed');
      navigate('/user/lists');
    },
  });

  const onRemoveMediaButtonClick = (item: Media) => {
    removeMediaMutation.mutate(item);
  };

  const onRemoveListButtonClick = () => {
    setIsConfirmRemoveListModalOpen(true);
  };

  const onConfirmRemoveListButtonClick = () => {
    removeListMutation.mutate();
  };

  if (isPending || isUserPending) {
    return <Loader className="min-h-[60vh]" />;
  }

  const movieCount = data?.movies.length ?? 0;
  const tvCount = data?.tvShows.length ?? 0;

  return (
    <div className="px-4 py-8 md:px-8 md:py-12">
      <div className="flex flex-col justify-between gap-6 border-b border-border pb-8 md:flex-row md:items-start">
        <div>
          <h1 className="text-2xl font-semibold text-foreground md:text-3xl">{data?.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {movieCount + tvCount} title{movieCount + tvCount === 1 ? '' : 's'}
          </p>
          {data?.description !== undefined && data.description !== '' && (
            <p className="mt-3 max-w-xl text-muted-foreground">{data.description}</p>
          )}
        </div>
        <div className="flex w-full shrink-0 items-center justify-between gap-3 md:w-auto md:justify-start">
          <Link
            to={`/u/${user?.username ?? ''}/lists/${data?.id ?? ''}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Public link
          </Link>
          <Button variant="outline" size="sm" onClick={onRemoveListButtonClick}>
            Delete list
          </Button>
        </div>
      </div>

      <ConfirmDialog
        open={isConfirmRemoveListModalOpen}
        onOpenChange={setIsConfirmRemoveListModalOpen}
        icon={<AlertTriangle aria-hidden="true" className="size-5" />}
        title={`Delete “${data?.name ?? 'this list'}”?`}
        description="Every title in this list will be removed. This action cannot be undone."
        confirmLabel="Delete list"
        destructive
        isLoading={removeListMutation.isPending}
        onConfirm={onConfirmRemoveListButtonClick}
      />

      <div className="flex gap-2 overflow-x-auto pt-6 pb-7 md:pb-10">
        <button
          type="button"
          className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
            activeTab === Type.Movie
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          }`}
          onClick={() => setActiveTab(Type.Movie)}
        >
          Movies · {movieCount}
        </button>
        <button
          type="button"
          className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
            activeTab === Type.Tv
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
          }`}
          onClick={() => setActiveTab(Type.Tv)}
        >
          TV Shows · {tvCount}
        </button>
      </div>

      {activeTab === Type.Movie && movieCount === 0 && (
        <EmptyState label="No movies in this list yet." />
      )}
      {activeTab === Type.Tv && tvCount === 0 && (
        <EmptyState label="No TV shows in this list yet." />
      )}

      <div className="grid grid-cols-2 gap-x-3 gap-y-7 pb-10 sm:grid-cols-autoFit sm:place-content-evenly sm:gap-x-6 sm:gap-y-10">
        {activeTab === Type.Movie
          ? data?.movies.map((movie: Media) => (
              <RemovableItem key={movie.id} media={movie} onRemove={onRemoveMediaButtonClick} />
            ))
          : data?.tvShows.map((tv: Media) => (
              <RemovableItem key={tv.id} media={tv} onRemove={onRemoveMediaButtonClick} />
            ))}
      </div>
      <Footer />
    </div>
  );
};

export const Detail = ListDetailComponent;
