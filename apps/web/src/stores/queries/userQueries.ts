import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { backendApi } from '@/api';

interface UserSocialSettings {
  readonly publicProfile: boolean;
  readonly showFollowers: boolean;
  readonly showFollowing: boolean;
}

interface UserProfile {
  readonly id: string;
  readonly username: string;
  readonly social: UserSocialSettings;
}

export interface UpdateSocialSettingsInput {
  readonly publicProfile?: boolean;
  readonly showFollowers?: boolean;
  readonly showFollowing?: boolean;
}

const userKeys = { profile: ['user'] as const };

export namespace UserQueries {
  export const useProfile = (enabled = true) =>
    useQuery<UserProfile>({
      queryKey: userKeys.profile,
      queryFn: () => backendApi.get<UserProfile>('/user/profile').then(res => res.data),
      enabled,
    });

  export const useUpdateSocialSettings = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (social: UpdateSocialSettingsInput) =>
        backendApi.put<UserProfile>('/user/profile', { social }).then(res => res.data),
      onSuccess(user) {
        queryClient.setQueryData(userKeys.profile, user);
      },
    });
  };
}
