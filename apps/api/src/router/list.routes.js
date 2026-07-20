import { verifyToken } from '../middleware/auth.middleware.js'
import ListController from '../controller/list.controller.js'
import express from 'express'

const listRouter = express.Router()
listRouter.get('/clear', verifyToken, (req, res) => {
  ListController.clearAll(req, res)
})

listRouter.get('/:id', verifyToken, (req, res) => {
  ListController.getListById(req, res)
})

listRouter.post('/', verifyToken, (req, res) => {
  ListController.create(req, res)
})

listRouter.get('/', verifyToken, (req, res) => {
  ListController.getAll(req, res)
})

listRouter.put('/:id', verifyToken, (req, res) => {
  ListController.update(req, res)
})

listRouter.delete('/:id', verifyToken, (req, res) => {
  ListController.remove(req, res)
})

listRouter.post('/:id/movie', verifyToken, (req, res) => {
  ListController.addMovie(req, res)
})

listRouter.delete('/:id/movie', verifyToken, (req, res) => {
  ListController.removeMovie(req, res)
})

listRouter.post('/:id/tv', verifyToken, (req, res) => {
  ListController.addTv(req, res)
})

listRouter.delete('/:id/tv', verifyToken, (req, res) => {
  ListController.removeTv(req, res)
})

listRouter.get('/:id/clear', verifyToken, (req, res) => {
  ListController.clear(req, res)
})

export default listRouter
