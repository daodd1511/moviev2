import ListService from '../service/listService.js';

const getAll = async (req, res) => {
  const lists = await ListService.getAll(req.userId);
  res.status(200).json(lists);
};

const getListById = async (req, res) => {
  const list = await ListService.getListById(req.userId, req.params.id);
  res.status(200).json(list);
};

const getListByUsername = async (req, res) => {
  const list = await ListService.getListByUsername(req.params.username, req.params.listId);
  res.status(200).json(list);
};

const create = async (req, res) => {
  const list = await ListService.create(req.userId, req.body);
  res.status(201).json(list);
};

const update = async (req, res) => {
  const list = await ListService.update(req.userId, req.params.id, req.body);
  res.status(200).json(list);
};

const remove = async (req, res) => {
  await ListService.delete(req.userId, req.params.id);
  res.status(200).json({ message: 'List deleted successfully.' });
};

const addMovie = async (req, res) => {
  const list = await ListService.addMovie(req.userId, req.params.id, req.body);
  res.status(200).json(list);
};

const removeMovie = async (req, res) => {
  const list = await ListService.removeMovie(req.userId, req.params.id, req.body);
  res.status(200).json(list);
};

const addTv = async (req, res) => {
  const list = await ListService.addTv(req.userId, req.params.id, req.body);
  res.status(200).json(list);
};

const removeTv = async (req, res) => {
  const list = await ListService.removeTv(req.userId, req.params.id, req.body);
  res.status(200).json(list);
};

const clear = async (req, res) => {
  const list = await ListService.clear(req.userId, req.params.id);
  res.status(200).json(list);
};

const clearAll = async (req, res) => {
  await ListService.clearAll(req.userId);
  res.status(200).json({ message: 'All lists cleared.' });
};

const ListController = {
  getAll,
  getListById,
  getListByUsername,
  create,
  update,
  remove,
  addMovie,
  removeMovie,
  addTv,
  removeTv,
  clear,
  clearAll,
};
export default ListController;
