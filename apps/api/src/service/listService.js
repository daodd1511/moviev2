import UserService from './userService.js'

const ListService = {}

ListService.getAll = async (userId) => {
  const user = await UserService.getUserById(userId)
  return user.lists
}

ListService.getListById = async (userId, id) => {
  const user = await UserService.getUserById(userId)
  const list = user.lists.find((list) => list._id.toString() === id)
  if (!list) {
    throw new Error('List not found')
  }
  return list
}

ListService.getListByUsername = async (username, listId) => {
  const user = await UserService.getUserByUsername(username)
  const list = user.lists.find((list) => list._id.toString() === listId)
  if (!list) {
    throw new Error('List not found')
  }
  return list
}

ListService.create = async (userId, listDetail) => {
  const user = await UserService.getUserById(userId)
  user.lists.push(listDetail)
  await UserService.update(userId, user)
  return listDetail
}

ListService.update = async (userId, listId, listDetail) => {
  const user = await UserService.getUserById(userId)
  const list = user.lists.find((list) => list._id.toString() === listId)
  if (!list) {
    throw new Error('List not found')
  }
  const newList = { ...list, ...listDetail }
  user.lists = user.lists.map((list) => {
    if (list._id.toString() === listId) {
      return newList
    }
    return list
  })
  await UserService.update(userId, user)
  return newList
}

ListService.delete = async (userId, id) => {
  const user = await UserService.getUserById(userId)
  const list = user.lists.find((list) => list._id.toString() === id)
  if (!list) {
    throw new Error('List not found')
  }
  user.lists = user.lists.filter((list) => list._id.toString() !== id)
  await UserService.update(userId, user)
}

ListService.addMovie = async (userId, listId, movie) => {
  const user = await UserService.getUserById(userId)
  const list = user.lists.find((list) => list._id.toString() === listId)
  if (!list) {
    throw new Error('List not found')
  }
  if (list.movies.includes(movie)) {
    throw new Error('Movie already in list')
  }
  list.movies.push(movie)
  await UserService.update(userId, user)
  return list
}

ListService.removeMovie = async (userId, listId, movie) => {
  const user = await UserService.getUserById(userId)
  const list = user.lists.find((list) => list._id.toString() === listId)
  if (!list) {
    throw new Error('List not found')
  }
  if (!list.movies.some((m) => m.id === movie.id)) {
    throw new Error('Movie not in list')
  }
  list.movies = list.movies.filter((m) => m.id !== movie.id)
  await UserService.update(userId, user)
  return list
}

ListService.addTv = async (userId, listId, tv) => {
  const user = await UserService.getUserById(userId)
  const list = user.lists.find((list) => list._id.toString() === listId)
  if (!list) {
    throw new Error('List not found')
  }
  if (list.tvShows.includes(tv)) {
    throw new Error('Tv already in list')
  }
  list.tvShows.push(tv)
  await UserService.update(userId, user)
  return list
}

ListService.removeTv = async (userId, listId, tv) => {
  const user = await UserService.getUserById(userId)
  const list = user.lists.find((list) => list._id.toString() === listId)
  if (!list) {
    throw new Error('List not found')
  }
  if (!list.tvShows.some((t) => t.id === tv.id)) {
    throw new Error('Tv not in list')
  }
  list.tvShows = list.tvShows.filter((t) => t.id !== tv.id)
  await UserService.update(userId, user)
  return list
}

ListService.clear = async (userId, listId) => {
  const user = await UserService.getUserById(userId)
  const list = user.lists.find((list) => list._id.toString() === listId)
  if (!list) {
    throw new Error('List not found')
  }
  list.movies = []
  list.tvShows = []
  await UserService.update(userId, user)
  return list
}

ListService.clearAll = async (userId) => {
  const user = await UserService.getUserById(userId)
  user.lists = []
  await UserService.update(userId, user)
}
export default ListService
