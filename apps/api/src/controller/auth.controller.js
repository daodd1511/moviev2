import AuthService from '../service/authService.js';

const AuthController = {};

AuthController.register = async (req, res) => {
  const user = await AuthService.register(req.body);
  res.status(201).json(user);
};

AuthController.login = async (req, res) => {
  const result = await AuthService.login(req.body);
  res.status(200).json(result);
};

export default AuthController;
