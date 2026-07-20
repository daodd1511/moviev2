import User from '../model/user.js'
import bcrypt from 'bcryptjs'

const UserService = {}

UserService.getUserById = async (id) => {
  const result = await User.findOne({ _id: id }).select('-password')
  return result
}

UserService.getUserByUsername = async (username) => {
  const result = await User.findOne({ username }).select('-password')
  return result
}
UserService.update = async (id, updateData) => {
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 10)
    await User.findByIdAndUpdate(id, updateData)
  } else {
    await User.findByIdAndUpdate(id, updateData)
  }
  return await User.findOne({ _id: id }).select('-password')
}
UserService.delete = async (id) => {
  await User.findByIdAndRemove(id)
  return await User.find().select('-password')
}
export default UserService
