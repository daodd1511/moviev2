import UserService from '../service/userService.js';
import { toPublicUser } from '../dto/user.dto.js';
import { AppError } from '../errors/app-error.js';

const getProfile = async (req, res) => {
  const user = await UserService.getUserById(req.userId);
  if (!user) {
    throw new AppError({ status: 404, code: 'user_not_found', message: 'User not found.' });
  }
  res.status(200).json(toPublicUser(user));
};

const updateProfile = async (req, res) => {
  const user = await UserService.updateProfile(req.userId, req.body);
  res.status(200).json(user);
};

const deleteUser = async (req, res) => {
  const newUsers = await UserService.delete(req.params.id);
  res.status(200).send(newUsers);
};

const UserController = {
  getProfile,
  updateProfile,
  deleteUser,
};
export default UserController;
