import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { CollectionMapper } from '@/api/mappers/collection.mapper';
import { CollectionService } from '@/api/services/collectionService';
import { getApiErrorMessage } from '@/api/utils/getApiErrorMessage';
import type { Collection } from '@/models/collection.model';
import { Media } from '@/models/media.model';
import { collectionKeys } from '@/stores/queries/collectionQueries';

export const useAddToCollection = (media: Media) => {
  const queryClient = useQueryClient();
  const item = CollectionMapper.itemFromMedia(media);
  const mutation = useMutation({
    mutationFn: (collection: Collection) =>
      CollectionService.addItem({ id: collection.id, version: collection.version, item }),
    onSuccess(collection) {
      queryClient.setQueryData(collectionKeys.detail(collection.id), collection);
      void queryClient.invalidateQueries({ queryKey: collectionKeys.list() });
      toast.success(`Added “${item.title}” to “${collection.name}”.`);
    },
    onError(error: unknown) {
      toast.error(getApiErrorMessage(error, 'Could not add this title to the Collection.'));
    },
  });

  const addToCollection = (collection: Collection): void => {
    if (
      collection.items.some(
        candidate => candidate.mediaType === item.mediaType && candidate.tmdbId === item.tmdbId,
      )
    ) {
      toast.error('This title is already in the Collection.');
      return;
    }
    mutation.mutate(collection);
  };

  return { addToCollection };
};
