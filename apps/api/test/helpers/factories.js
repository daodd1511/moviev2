import bcrypt from 'bcryptjs';
import User from '../../src/model/user.js';

let sequence = 0;

/** Builds a unique, valid user registration payload for tests. */
export const buildUserInput = (overrides = {}) => {
  sequence += 1;
  return {
    username: `user${sequence}`,
    email: `user${sequence}@example.com`,
    password: 'Password123!',
    first_name: 'Test',
    last_name: 'User',
    ...overrides,
  };
};

/** Persists a user directly via the model, bypassing the HTTP registration flow. */
export const createUser = async (overrides = {}) => {
  const input = buildUserInput(overrides);
  const hashedPassword = await bcrypt.hash(input.password, 8);
  const user = await User.create({ ...input, password: hashedPassword });
  return { user, plainPassword: input.password };
};

let mediaSequence = 0;

/** Builds a unique, schema-valid media payload matching the web app's Media model. */
export const buildMedia = (overrides = {}) => {
  mediaSequence += 1;
  return {
    id: mediaSequence,
    posterPath: `/poster-${mediaSequence}.jpg`,
    releaseDate: '2020-01-01',
    title: `Media ${mediaSequence}`,
    voteAverage: 7.5,
    type: 'movie',
    ...overrides,
  };
};
