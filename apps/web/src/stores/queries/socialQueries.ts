import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { SocialService } from '@/api/services/socialService';
import type {
  DiscoverCollectionsInput,
  PublicCollection,
  SocialProfile,
} from '@/models/social.model';

export const socialKeys = {
  all: ['social'] as const,
  profile: (username: string) => [...socialKeys.all, 'profile', username] as const,
  followers: (username: string) => [...socialKeys.all, 'followers', username] as const,
  following: (username: string) => [...socialKeys.all, 'following', username] as const,
  discovery: (input: DiscoverCollectionsInput) => [...socialKeys.all, 'discovery', input] as const,
  collection: (id: string) => [...socialKeys.all, 'collection', id] as const,
};

export namespace SocialQueries {
  export const useProfile = (username: string) =>
    useQuery({
      queryKey: socialKeys.profile(username),
      queryFn: () => SocialService.getProfile(username),
      enabled: username.length > 0,
    });

  export const useFollowers = (username: string, enabled: boolean) =>
    useQuery({
      queryKey: socialKeys.followers(username),
      queryFn: () => SocialService.listFollowers(username),
      enabled,
    });

  export const useFollowing = (username: string, enabled: boolean) =>
    useQuery({
      queryKey: socialKeys.following(username),
      queryFn: () => SocialService.listFollowing(username),
      enabled,
    });

  export const useDiscovery = (input: DiscoverCollectionsInput) =>
    useQuery({
      queryKey: socialKeys.discovery(input),
      queryFn: () => SocialService.discoverCollections(input),
    });

  export const useCollection = (id: string) =>
    useQuery({
      queryKey: socialKeys.collection(id),
      queryFn: () => SocialService.getCollection(id),
      enabled: id.length > 0,
    });

  export const useFollow = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: SocialService.follow,
      onMutate: async username => {
        await queryClient.cancelQueries({ queryKey: socialKeys.profile(username) });
        const previous = queryClient.getQueryData<SocialProfile>(socialKeys.profile(username));
        if (previous !== undefined)
          queryClient.setQueryData<SocialProfile>(socialKeys.profile(username), {
            ...previous,
            isFollowedByViewer: true,
            followerCount: previous.followerCount + 1,
          });
        return { previous, username };
      },
      onError: (_error, _username, context) => {
        if (context?.previous !== undefined)
          queryClient.setQueryData(socialKeys.profile(context.username), context.previous);
      },
      onSettled: (_data, _error, username) => {
        void queryClient.invalidateQueries({ queryKey: socialKeys.profile(username) });
      },
    });
  };

  export const useUnfollow = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: SocialService.unfollow,
      onMutate: async username => {
        await queryClient.cancelQueries({ queryKey: socialKeys.profile(username) });
        const previous = queryClient.getQueryData<SocialProfile>(socialKeys.profile(username));
        if (previous !== undefined)
          queryClient.setQueryData<SocialProfile>(socialKeys.profile(username), {
            ...previous,
            isFollowedByViewer: false,
            followerCount: Math.max(0, previous.followerCount - 1),
          });
        return { previous, username };
      },
      onError: (_error, _username, context) => {
        if (context?.previous !== undefined)
          queryClient.setQueryData(socialKeys.profile(context.username), context.previous);
      },
      onSettled: (_data, _error, username) => {
        void queryClient.invalidateQueries({ queryKey: socialKeys.profile(username) });
      },
    });
  };

  export const useLike = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: SocialService.like,
      onMutate: async id => {
        await queryClient.cancelQueries({ queryKey: socialKeys.collection(id) });
        const previous = queryClient.getQueryData<PublicCollection>(socialKeys.collection(id));
        if (previous !== undefined)
          queryClient.setQueryData<PublicCollection>(socialKeys.collection(id), {
            ...previous,
            isLikedByViewer: true,
            likeCount: previous.likeCount + 1,
          });
        return { previous, id };
      },
      onError: (_error, _id, context) => {
        if (context?.previous !== undefined)
          queryClient.setQueryData(socialKeys.collection(context.id), context.previous);
      },
      onSettled: (_data, _error, id) => {
        void queryClient.invalidateQueries({ queryKey: socialKeys.collection(id) });
      },
    });
  };

  export const useUnlike = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: SocialService.unlike,
      onMutate: async id => {
        await queryClient.cancelQueries({ queryKey: socialKeys.collection(id) });
        const previous = queryClient.getQueryData<PublicCollection>(socialKeys.collection(id));
        if (previous !== undefined)
          queryClient.setQueryData<PublicCollection>(socialKeys.collection(id), {
            ...previous,
            isLikedByViewer: false,
            likeCount: Math.max(0, previous.likeCount - 1),
          });
        return { previous, id };
      },
      onError: (_error, _id, context) => {
        if (context?.previous !== undefined)
          queryClient.setQueryData(socialKeys.collection(context.id), context.previous);
      },
      onSettled: (_data, _error, id) => {
        void queryClient.invalidateQueries({ queryKey: socialKeys.collection(id) });
      },
    });
  };
}
