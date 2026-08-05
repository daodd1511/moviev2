import { isAxiosError } from 'axios';
import { Copy, CopyPlus, ExternalLink, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { Collaborators } from '../components/Collaborators';
import { CollectionForm } from '../components/CollectionForm';
import { CollectionItems } from '../components/CollectionItems';
import { CollectionPosterStrip } from '../components/CollectionPosterStrip';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getApiErrorMessage, type ApiErrorEnvelope } from '@/api/utils/getApiErrorMessage';
import type { Collection, CreateCollectionInput } from '@/models/collection.model';
import { Loader } from '@/shared/components';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { IMAGE_BASE_URL } from '@/shared/constants';
import { PosterSizes } from '@/shared/enums';
import { formatMediumDate } from '@/shared/utils/formatDate';
import { CollectionQueries } from '@/stores/queries/collectionQueries';
import { UserQueries } from '@/stores/queries/userQueries';

const isVersionConflict = (error: unknown): boolean =>
  isAxiosError<ApiErrorEnvelope>(error) &&
  error.response?.data.error.code === 'collection_version_conflict';

const CONFLICT_MESSAGE =
  'This Collection changed elsewhere. Your changes weren’t saved — review and save again.';

const VISIBILITY_LABEL = {
  private: 'Private',
  unlisted: 'Unlisted',
  public: 'Public',
} as const;

const countLabel = (count: number, noun: string): string =>
  `${count} ${noun}${count === 1 ? '' : 's'}`;

/** The Collection's chosen cover, falling back to its first title. */
const coverPosterUrl = (collection: Collection): string | null => {
  const cover =
    collection.cover === null
      ? collection.items[0]
      : collection.items.find(
          item =>
            item.mediaType === collection.cover?.mediaType &&
            item.tmdbId === collection.cover.tmdbId,
        );
  if (cover === undefined || cover.posterPath === null) return null;
  return `${IMAGE_BASE_URL}${PosterSizes.large}${cover.posterPath}`;
};

export const CollectionPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { data: collection, isPending, refetch } = CollectionQueries.useById(id);
  const { data: user } = UserQueries.useProfile();
  const update = CollectionQueries.useUpdate();
  const duplicate = CollectionQueries.useDuplicate();
  const remove = CollectionQueries.useRemove();

  const handleUpdate = (
    values: Pick<CreateCollectionInput, 'name' | 'description' | 'visibility'>,
  ): void => {
    if (collection === undefined) return;
    update.mutate(
      { ...values, id: collection.id, version: collection.version },
      {
        onSuccess: () => {
          setShowDetails(false);
          toast.success('Collection saved.');
        },
        onError: error => {
          if (isVersionConflict(error)) {
            void refetch();
            toast.error(CONFLICT_MESSAGE);
          } else {
            toast.error(getApiErrorMessage(error, 'Could not save the Collection.'));
          }
        },
      },
    );
  };

  const handleDuplicate = (): void => {
    if (collection === undefined) return;
    duplicate.mutate(collection.id, {
      onSuccess: copy => {
        toast.success('Collection duplicated.');
        navigate(`/collections/${copy.id}`);
      },
      onError: error =>
        toast.error(getApiErrorMessage(error, 'Could not duplicate the Collection.')),
    });
  };

  const handleCopyLink = async (): Promise<void> => {
    if (collection === undefined || user?.username === undefined) return;
    const link = `${window.location.origin}/u/${user.username}/collections/${collection.id}`;
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Collection link copied.');
    } catch {
      toast.error('Could not copy the Collection link.');
    }
  };

  const handleDelete = (): void => {
    if (collection === undefined) return;
    remove.mutate(
      { id: collection.id, version: collection.version },
      {
        onSuccess: () => {
          toast.success('Collection deleted.');
          navigate('/user/collections');
        },
        onError: error => {
          if (isVersionConflict(error)) {
            void refetch();
            toast.error('This Collection changed elsewhere. It wasn’t deleted — try again.');
          } else {
            toast.error(getApiErrorMessage(error, 'Could not delete the Collection.'));
          }
        },
      },
    );
  };

  if (isPending || collection === undefined) return <Loader className="min-h-[60vh]" />;

  const coverUrl = coverPosterUrl(collection);

  return (
    <main className="page-shell">
      <header className="relative isolate overflow-hidden rounded-2xl border border-foreground/10">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <CollectionPosterStrip
            items={collection.items}
            limit={8}
            className="size-full scale-110 opacity-40 blur-2xl"
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-background via-background/92 to-background/70" />
        </div>

        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-end sm:p-8">
          {coverUrl !== null && (
            <img
              src={coverUrl}
              alt=""
              className="w-24 shrink-0 rounded-md object-cover shadow-[0_24px_48px_-12px_rgba(0,0,0,0.7)] outline outline-1 outline-foreground/15 sm:w-32"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
              Collection
            </p>
            <h1 className="mt-2 text-3xl leading-tight font-light tracking-tight md:text-4xl">
              {collection.name}
            </h1>
            {collection.description !== null && (
              <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">
                {collection.description}
              </p>
            )}
            <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs tracking-[0.14em] text-muted-foreground uppercase">
              <span className="rounded-full border border-foreground/20 px-2.5 py-0.5">
                {VISIBILITY_LABEL[collection.visibility]}
              </span>
              <span>{countLabel(collection.items.length, 'title')}</span>
              <span aria-hidden="true">·</span>
              <span>{countLabel(collection.likeCount, 'like')}</span>
              <span aria-hidden="true">·</span>
              <span>Updated {formatMediumDate(collection.updatedAt)}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-foreground/10 bg-background/40 px-6 py-4 sm:px-8">
          <Dialog open={showDetails} onOpenChange={setShowDetails}>
            <DialogTrigger asChild>
              <Button type="button">
                <Pencil aria-hidden="true" className="size-4" /> Edit details
              </Button>
            </DialogTrigger>
            <DialogContent
              aria-describedby={undefined}
              className="max-h-[85vh] overflow-y-auto sm:max-w-lg"
            >
              <DialogHeader>
                <DialogTitle className="text-xl leading-tight">Collection details</DialogTitle>
              </DialogHeader>
              <CollectionForm
                collection={collection}
                submitLabel="Save changes"
                isPending={update.isPending}
                onSubmit={handleUpdate}
                onCancel={() => setShowDetails(false)}
              />
            </DialogContent>
          </Dialog>
          <Button type="button" variant="outline" onClick={() => void handleCopyLink()}>
            <Copy aria-hidden="true" className="size-4" /> Copy link
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={duplicate.isPending}
            onClick={handleDuplicate}
          >
            <CopyPlus aria-hidden="true" className="size-4" /> Duplicate
          </Button>
          <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
            <Link to={`/u/${user?.username ?? ''}/collections/${collection.id}`}>
              <ExternalLink aria-hidden="true" className="size-4" /> Public view
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="ml-auto text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setShowDelete(true)}
          >
            <Trash2 aria-hidden="true" className="size-4" /> Delete
          </Button>
        </div>
      </header>

      <Collaborators
        collection={collection}
        currentUserId={user?.id}
        onReload={() => void refetch()}
      />
      <CollectionItems collection={collection} />

      <ConfirmDialog
        open={showDelete}
        onOpenChange={setShowDelete}
        icon={<Trash2 aria-hidden="true" className="size-5" />}
        title={`Delete “${collection.name}”?`}
        description="This removes the Collection and its titles. This action cannot be undone."
        confirmLabel="Delete Collection"
        destructive
        isLoading={remove.isPending}
        onConfirm={handleDelete}
      />
    </main>
  );
};
