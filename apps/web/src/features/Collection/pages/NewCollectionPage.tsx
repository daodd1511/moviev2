import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { CollectionForm } from '../components/CollectionForm';

import type { CreateCollectionInput } from '@/models/collection.model';
import { getApiErrorMessage } from '@/api/utils/getApiErrorMessage';
import { CollectionQueries } from '@/stores/queries/collectionQueries';

export const NewCollectionPage = () => {
  const navigate = useNavigate();
  const create = CollectionQueries.useCreate();

  const handleSubmit = (values: Pick<CreateCollectionInput, 'name' | 'description' | 'visibility'>): void => {
    create.mutate(
      { ...values, items: [], cover: null },
      {
        onSuccess: collection => {
          toast.success('Collection created. Add titles when you are ready.');
          navigate(`/collections/${collection.id}`);
        },
        onError: error => toast.error(getApiErrorMessage(error, 'Could not create the Collection.')),
      },
    );
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8 md:px-8 md:py-12">
      <h1 className="text-2xl font-semibold md:text-3xl">Create Collection</h1>
      <p className="mt-2 text-muted-foreground">Keep it private, share an unlisted link, or publish it for everyone.</p>
      <div className="mt-8"><CollectionForm submitLabel="Create Collection" isPending={create.isPending} onSubmit={handleSubmit} /></div>
    </main>
  );
};
