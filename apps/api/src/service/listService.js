import UserService from './userService.js';
import { AppError } from '../errors/app-error.js';

const ListService = {};

const notFound = (code, message) => new AppError({ status: 404, code, message });

const getUserOrThrow = async userId => {
  const user = await UserService.getUserById(userId);
  if (!user) {
    throw notFound('user_not_found', 'User not found.');
  }
  return user;
};

const getUserByUsernameOrThrow = async username => {
  const user = await UserService.getUserByUsername(username);
  if (!user) {
    throw notFound('user_not_found', 'User not found.');
  }
  return user;
};

const findListOrThrow = (user, listId) => {
  const list = user.lists.find(item => item._id.toString() === listId);
  if (!list) {
    throw notFound('list_not_found', 'List not found.');
  }
  return list;
};

// Dedupe/lookup by (type, id), not object identity — the previous `.includes(movie)` and
// bare `m.id === movie.id` checks either always missed real duplicates or ignored the
// media's type.
const isSameMedia = (a, b) => a.id === b.id && a.type === b.type;

ListService.getAll = async userId => {
  const user = await getUserOrThrow(userId);
  return user.lists;
};

ListService.getListById = async (userId, id) => {
  const user = await getUserOrThrow(userId);
  return findListOrThrow(user, id);
};

ListService.getListByUsername = async (username, listId) => {
  const user = await getUserByUsernameOrThrow(username);
  return findListOrThrow(user, listId);
};

ListService.create = async (userId, listDetail) => {
  const user = await getUserOrThrow(userId);
  user.lists.push(listDetail);
  await UserService.update(userId, user);
  return listDetail;
};

ListService.update = async (userId, listId, listDetail) => {
  const user = await getUserOrThrow(userId);
  const list = findListOrThrow(user, listId);
  const newList = { ...list, ...listDetail };
  user.lists = user.lists.map(item => (item._id.toString() === listId ? newList : item));
  await UserService.update(userId, user);
  return newList;
};

ListService.delete = async (userId, id) => {
  const user = await getUserOrThrow(userId);
  findListOrThrow(user, id);
  user.lists = user.lists.filter(list => list._id.toString() !== id);
  await UserService.update(userId, user);
};

ListService.addMovie = async (userId, listId, movie) => {
  const user = await getUserOrThrow(userId);
  const list = findListOrThrow(user, listId);
  if (list.movies.some(m => isSameMedia(m, movie))) {
    throw new AppError({
      status: 409,
      code: 'media_already_in_list',
      message: 'Movie is already in this list.',
    });
  }
  list.movies.push(movie);
  await UserService.update(userId, user);
  return list;
};

ListService.removeMovie = async (userId, listId, movie) => {
  const user = await getUserOrThrow(userId);
  const list = findListOrThrow(user, listId);
  if (!list.movies.some(m => isSameMedia(m, movie))) {
    throw notFound('media_not_in_list', 'Movie is not in this list.');
  }
  list.movies = list.movies.filter(m => !isSameMedia(m, movie));
  await UserService.update(userId, user);
  return list;
};

ListService.addTv = async (userId, listId, tv) => {
  const user = await getUserOrThrow(userId);
  const list = findListOrThrow(user, listId);
  if (list.tvShows.some(t => isSameMedia(t, tv))) {
    throw new AppError({
      status: 409,
      code: 'media_already_in_list',
      message: 'Show is already in this list.',
    });
  }
  list.tvShows.push(tv);
  await UserService.update(userId, user);
  return list;
};

ListService.removeTv = async (userId, listId, tv) => {
  const user = await getUserOrThrow(userId);
  const list = findListOrThrow(user, listId);
  if (!list.tvShows.some(t => isSameMedia(t, tv))) {
    throw notFound('media_not_in_list', 'Show is not in this list.');
  }
  list.tvShows = list.tvShows.filter(t => !isSameMedia(t, tv));
  await UserService.update(userId, user);
  return list;
};

ListService.clear = async (userId, listId) => {
  const user = await getUserOrThrow(userId);
  const list = findListOrThrow(user, listId);
  list.movies = [];
  list.tvShows = [];
  await UserService.update(userId, user);
  return list;
};

ListService.clearAll = async userId => {
  const user = await getUserOrThrow(userId);
  user.lists = [];
  await UserService.update(userId, user);
};

export default ListService;
