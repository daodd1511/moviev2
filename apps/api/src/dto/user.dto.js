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
});
