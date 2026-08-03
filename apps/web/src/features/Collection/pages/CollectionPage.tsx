import { isAxiosError } from 'axios';
import { Copy, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

import { Collaborators } from '../components/Collaborators';
import { CollectionForm } from '../components/CollectionForm';
import { CollectionItems } from '../components/CollectionItems';

import { Button } from '@/components/ui/button';
import { getApiErrorMessage, type ApiErrorEnvelope } from '@/api/utils/getApiErrorMessage';
import type { CreateCollectionInput } from '@/models/collection.model';
import { Loader } from '@/shared/components';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { CollectionQueries } from '@/stores/queries/collectionQueries';
import { UserQueries } from '@/stores/queries/userQueries';

const isVersionConflict = (error: unknown): boolean =>
  isAxiosError<ApiErrorEnvelope>(error) &&
  error.response?.data.error.code === 'collection_version_conflict';

export const CollectionPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDelete, setShowDelete] = useState(false);
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
        onSuccess: () => toast.success('Collection saved.'),
        onError: error => {
          toast.error(getApiErrorMessage(error, 'Could not save the Collection.'));
          if (isVersionConflict(error)) void refetch();
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
          toast.error(getApiErrorMessage(error, 'Could not delete the Collection.'));
          if (isVersionConflict(error)) void refetch();
        },
      },
    );
  };

  if (isPending || collection === undefined) return <Loader className="min-h-[60vh]" />;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-12">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-6">
        <div>
          <p className="text-sm text-muted-foreground">Version {collection.version}</p>
          <h1 className="text-2xl font-semibold md:text-3xl">Edit Collection</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => void handleCopyLink()}>
            <Copy aria-hidden="true" className="size-4" /> Copy link
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={duplicate.isPending}
            onClick={handleDuplicate}
          >
            Duplicate
          </Button>
          <Button type="button" variant="outline" onClick={() => void refetch()}>
            <RefreshCw aria-hidden="true" className="size-4" /> Reload
          </Button>
          <Button type="button" variant="destructive" onClick={() => setShowDelete(true)}>
            <Trash2 aria-hidden="true" className="size-4" /> Delete
          </Button>
        </div>
      </div>
      <div className="mt-8 max-w-2xl">
        <CollectionForm
          collection={collection}
          submitLabel="Save changes"
          isPending={update.isPending}
          onSubmit={handleUpdate}
        />
      </div>
      <CollectionItems collection={collection} />
      <Collaborators
        collection={collection}
        currentUserId={user?.id}
        onReload={() => void refetch()}
      />
      <p className="mt-6 text-sm text-muted-foreground">
        A conflict reloads this Collection so you can retry with the latest version.
      </p>
      <p className="mt-3 text-sm">
        <Link
          className="text-primary hover:underline"
          to={`/u/${user?.username ?? ''}/collections/${collection.id}`}
        >
          Open public Collection view
        </Link>
      </p>
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
