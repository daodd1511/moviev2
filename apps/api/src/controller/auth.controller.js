import AuthService from '../service/authService.js'
const AuthController = {}
AuthController.Register = async (req, res) => {
  try {
    AuthService.Register(req, res)
  } catch (err) {
    res.send(err)
  }
}
AuthController.Login = async (req, res) => {
  try {
    AuthService.Login(req, res)
  } catch (err) {
    res.send(err)
  }
}
AuthController.ForgotPassword = async (req, res) => {
  try {
    AuthService.ForgotPassword(req, res)
  } catch (err) {
    res.send(err)
  }
}
AuthController.ResetPassword = (req, res) => {
  try {
    AuthService.ResetPassword(req, res)
  } catch (err) {
    res.send(err)
  }
}
export default AuthController
