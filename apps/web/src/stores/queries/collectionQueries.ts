import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { CollectionService } from '@/api/services/collectionService';
import type {
  Collection,
  CollectionItemMutationInput,
  CollectionItemRemovalInput,
  CollectionRemovalInput,
  CollectionReorderInput,
  CreateCollectionInput,
  UpdateCollectionInput,
} from '@/models/collection.model';

export const collectionKeys = {
  all: ['collections'] as const,
  list: () => [...collectionKeys.all, 'list'] as const,
  detail: (id: string) => [...collectionKeys.all, 'detail', id] as const,
  public: (username: string, id: string) =>
    [...collectionKeys.all, 'public', username, id] as const,
};

const replaceCollection = (collections: readonly Collection[] | undefined, next: Collection) =>
  collections?.map(collection => (collection.id === next.id ? next : collection));

const updateCache = (
  queryClient: ReturnType<typeof useQueryClient>,
  collection: Collection,
): void => {
  queryClient.setQueryData(collectionKeys.detail(collection.id), collection);
  queryClient.setQueryData<readonly Collection[]>(collectionKeys.list(), current =>
    replaceCollection(current, collection),
  );
};

const invalidateCollections = (queryClient: ReturnType<typeof useQueryClient>) => {
  void queryClient.invalidateQueries({ queryKey: collectionKeys.list() });
};

export namespace CollectionQueries {
  export const useAll = (enabled = true) =>
    useQuery({ queryKey: collectionKeys.list(), queryFn: CollectionService.list, enabled });

  export const useById = (id: string) =>
    useQuery({ queryKey: collectionKeys.detail(id), queryFn: () => CollectionService.getById(id) });

  export const usePublic = (username: string, id: string) =>
    useQuery({
      queryKey: collectionKeys.public(username, id),
      queryFn: () => CollectionService.getPublic(username, id),
    });

  export const useCreate = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: CollectionService.create,
      onSuccess(collection) {
        queryClient.setQueryData<readonly Collection[]>(collectionKeys.list(), current => [
          collection,
          ...(current ?? []),
        ]);
      },
      onSettled() {
        return queryClient.invalidateQueries({ queryKey: collectionKeys.list() });
      },
    });
  };

  export const useUpdate = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: CollectionService.update,
      onSuccess: collection => updateCache(queryClient, collection),
      onSettled() {
        invalidateCollections(queryClient);
      },
    });
  };

  export const useAddItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: CollectionService.addItem,
      onSuccess: collection => updateCache(queryClient, collection),
      onSettled() {
        invalidateCollections(queryClient);
      },
    });
  };

  export const useRemoveItem = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: CollectionService.removeItem,
      onSuccess: collection => updateCache(queryClient, collection),
      onSettled() {
        invalidateCollections(queryClient);
      },
    });
  };

  export const useReorder = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: CollectionService.reorderItems,
      onSuccess: collection => updateCache(queryClient, collection),
      onSettled() {
        invalidateCollections(queryClient);
      },
    });
  };

  export const useDuplicate = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: CollectionService.duplicate,
      onSuccess(collection) {
        queryClient.setQueryData<readonly Collection[]>(collectionKeys.list(), current => [
          collection,
          ...(current ?? []),
        ]);
      },
      onSettled() {
        return queryClient.invalidateQueries({ queryKey: collectionKeys.list() });
      },
    });
  };

  export const useRemove = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: CollectionService.remove,
      onSuccess(_data, input) {
        queryClient.setQueryData<readonly Collection[]>(collectionKeys.list(), current =>
          current?.filter(collection => collection.id !== input.id),
        );
        queryClient.removeQueries({ queryKey: collectionKeys.detail(input.id) });
      },
      onSettled() {
        invalidateCollections(queryClient);
      },
    });
  };
}
