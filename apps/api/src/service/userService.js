import User from '../model/user.js';
import bcrypt from 'bcryptjs';
import { AppError } from '../errors/app-error.js';
import { toPublicUser } from '../dto/user.dto.js';

const UserService = {};

UserService.getUserById = async id => {
  const result = await User.findOne({ _id: id }).select('-password');
  return result;
};

UserService.getUserByUsername = async username => {
  const result = await User.findOne({ username }).select('-password');
  return result;
};

// Permits only the current profile fields already stored by the User model — password
// changes stay out of scope, and the target user is always the authenticated `userId`,
// never a value from the request body.
UserService.updateProfile = async (userId, input) => {
  const updated = await User.findByIdAndUpdate(userId, input, { new: true }).select('-password');
  if (!updated) {
    throw new AppError({ status: 404, code: 'user_not_found', message: 'User not found.' });
  }
  return toPublicUser(updated);
};

UserService.update = async (id, updateData) => {
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10);
    await User.findByIdAndUpdate(id, updateData);
  } else {
    await User.findByIdAndUpdate(id, updateData);
  }
  return await User.findOne({ _id: id }).select('-password');
};
UserService.delete = async id => {
  await User.findByIdAndRemove(id);
  return await User.find().select('-password');
};
export default UserService;
