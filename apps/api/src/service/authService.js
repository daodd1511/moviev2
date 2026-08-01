import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../model/user.js';
import { AppError } from '../errors/app-error.js';
import { toPublicUser } from '../dto/user.dto.js';

const invalidCredentials = () =>
  new AppError({
    status: 401,
    code: 'invalid_credentials',
    message: 'Invalid username or password.',
  });

const AuthService = {};

AuthService.register = async input => {
  const encryptedPassword = await bcrypt.hash(input.password, 10);
  const user = await User.create({
    first_name: input.first_name,
    last_name: input.last_name,
    username: input.username,
    email: input.email,
    password: encryptedPassword,
  });
  return toPublicUser(user);
};

// Returns the same generic error for "no such user" and "wrong password" so a response
// can't be used to enumerate registered usernames.
AuthService.login = async input => {
  const user = await User.findOne({ username: input.username });
  if (!user) {
    throw invalidCredentials();
  }

  const passwordIsValid = await bcrypt.compare(input.password, user.password);
  if (!passwordIsValid) {
    throw invalidCredentials();
  }

  const accessToken = jwt.sign({ id: user._id }, process.env.TOKEN_KEY, {
    expiresIn: '30d',
  });
  return { id: user._id.toString(), accessToken };
};

export default AuthService;
