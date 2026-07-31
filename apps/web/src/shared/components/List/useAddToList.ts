import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

import { getApiErrorMessage } from '@/api/utils/getApiErrorMessage';
import { ListService } from '@/api/services/listService';
import { List, Media } from '@/models';
import { MediaType } from '@/shared/enums/mediaType';

/** Adds `media` to a list, invalidating the affected list queries and reporting
 * media-specific success/failure feedback. Extracted out of `Menu` so this mutation
 * logic is testable without driving the Radix dropdown/submenu it renders inside. */
export const useAddToList = (media: Media) => {
  const queryClient = useQueryClient();
  const isMovie = media.type === MediaType.Movie;
  const label = isMovie ? 'Movie' : 'Show';

  const mutation = useMutation({
    mutationFn: (list: List) => ListService.update(list),
    async onSuccess(_data, list) {
      await queryClient.invalidateQueries({ queryKey: ['lists'] });
      await queryClient.invalidateQueries({ queryKey: ['listDetail', list.id] });
      toast.success(`${label} added to "${list.name}"`);
    },
    onError(error: unknown) {
      toast.error(getApiErrorMessage(error, `Could not add ${label.toLowerCase()} to list`));
    },
  });

  const addToList = (list: List): void => {
    const existingItem = isMovie
      ? list.movies.find(item => item.id === media.id)
      : list.tvShows.find(item => item.id === media.id);

    if (existingItem !== undefined) {
      toast.error(`${label} already in list`);
      return;
    }

    const newList = isMovie
      ? { ...list, movies: [...list.movies, media] }
      : { ...list, tvShows: [...list.tvShows, media] };

    mutation.mutate(newList as List);
  };

  return { addToList };
};
