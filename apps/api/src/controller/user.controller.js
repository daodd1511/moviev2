import UserService from '../service/userService.js'

const getUserById = async (req, res) => {
  try {
    await UserService.getUserById(req.params.id || req.userId).then((user) => {
      res.status(200).send(user)
    })
  } catch (err) {
    res.status(404).send({ message: 'User not found' })
  }
}
const updateUser = async (req, res) => {
  await UserService.update(req.params.id, req.body).then((updatedUser) => {
    res.status(200).send(updatedUser)
  })
}
const deleteUser = async (req, res) => {
  await UserService.delete(req.params.id).then((newUsers) => {
    res.status(200).send(newUsers)
  })
}
const UserController = {
  getUserById,
  updateUser,
  deleteUser
}
export default UserController
