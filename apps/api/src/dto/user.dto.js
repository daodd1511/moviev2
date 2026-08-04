/** Maps a User document to the public shape returned by registration and profile
 * endpoints. Never includes `password` or any other internal field. */
export const toPublicUser = user => ({
  id: user._id.toString(),
  username: user.username,
  email: user.email,
  firstName: user.first_name,
  lastName: user.last_name,
  phone: user.phone,
  gender: user.gender,
  social: {
    publicProfile: user.social.publicProfile,
    showFollowers: user.social.showFollowers,
    showFollowing: user.social.showFollowing,
  },
});

/** Maps a User document to the shape shown to OTHER users viewing a public profile.
 * Deliberately excludes `email` and `phone` — those never leave the owner's own
 * `toPublicUser` response. */
export const toSocialProfileDto = (
  user,
  { followerCount, followingCount, isFollowedByViewer },
) => ({
  username: user.username,
  firstName: user.first_name,
  lastName: user.last_name,
  followerCount,
  followingCount,
  isFollowedByViewer,
});
