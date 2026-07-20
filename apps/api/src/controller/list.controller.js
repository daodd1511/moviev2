import ListService from '../service/listService.js'

const getAll = async (req, res) => {
  try {
    const lists = await ListService.getAll(req.userId)
    res.status(200).send(lists)
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

const getListById = async (req, res) => {
  try {
    const list = await ListService.getListById(req.userId, req.params.id)
    res.status(200).send(list)
  } catch (error) {
    res.status(404).send({ message: error.message })
  }
}

const getListByUsername = async (req, res) => {
  try {
    const list = await ListService.getListByUsername(req.params.username, req.params.listId)
    res.status(200).send(list)
  } catch (error) {
    res.status(404).send({ message: error.message })
  }
}

const create = async (req, res) => {
  try {
    const list = await ListService.create(req.userId, req.body)
    res.status(201).send(list)
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

const update = async (req, res) => {
  try {
    const list = await ListService.update(req.userId, req.params.id, req.body)
    res.status(200).send(list)
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

const remove = async (req, res) => {
  try {
    await ListService.delete(req.userId, req.params.id)
    res.status(200).send({ message: 'List deleted successfully' })
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

const addMovie = async (req, res) => {
  try {
    const list = await ListService.addMovie(req.userId, req.params.id, req.body)
    res.status(200).send(list)
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

const removeMovie = async (req, res) => {
  try {
    const list = await ListService.removeMovie(req.userId, req.params.id, req.body)
    res.status(200).send(list)
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

const addTv = async (req, res) => {
  try {
    const list = await ListService.addTv(req.userId, req.params.id, req.body)
    res.status(200).send(list)
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

const removeTv = async (req, res) => {
  try {
    const list = await ListService.removeTv(req.userId, req.params.id, req.body)
    res.status(200).send(list)
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

const clear = async (req, res) => {
  try {
    const list = await ListService.clear(req.userId, req.params.id)
    res.status(200).send(list)
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

const clearAll = async (req, res) => {
  try {
    const lists = await ListService.clearAll(req.userId)
    res.status(200).send(lists)
  } catch (error) {
    res.status(400).send({ message: error.message })
  }
}

const ListController = {
  getListById,
  create,
  getAll,
  update,
  remove,
  addMovie,
  removeMovie,
  addTv,
  removeTv,
  clear,
  clearAll,
  getListByUsername
}
export default ListController
