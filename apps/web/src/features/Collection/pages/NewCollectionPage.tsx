import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { CollectionForm } from '../components/CollectionForm';

import type { CreateCollectionInput } from '@/models/collection.model';
import { getApiErrorMessage } from '@/api/utils/getApiErrorMessage';
import { CollectionQueries } from '@/stores/queries/collectionQueries';

export const NewCollectionPage = () => {
  const navigate = useNavigate();
  const create = CollectionQueries.useCreate();

  const handleSubmit = (
    values: Pick<CreateCollectionInput, 'name' | 'description' | 'visibility'>,
  ): void => {
    create.mutate(
      { ...values, items: [], cover: null },
      {
        onSuccess: collection => {
          toast.success('Collection created. Add titles when you are ready.');
          navigate(`/collections/${collection.id}`);
        },
        onError: error =>
          toast.error(getApiErrorMessage(error, 'Could not create the Collection.')),
      },
    );
  };

  return (
    <main className="page-shell">
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-medium tracking-[0.2em] text-muted-foreground uppercase">
          Collections
        </p>
        <h1 className="mt-2 text-3xl leading-tight font-light tracking-tight md:text-4xl">
          Create Collection
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Keep it private, share an unlisted link, or publish it for everyone.
        </p>
        <div className="mt-8">
          <CollectionForm
            submitLabel="Create Collection"
            isPending={create.isPending}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </main>
  );
};
