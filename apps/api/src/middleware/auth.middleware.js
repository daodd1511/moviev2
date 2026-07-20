import jwt from 'jsonwebtoken'
import User from '../model/user.js'

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      res.status(401).send({ message: 'No token provided' })
      return
    }
    const token = authHeader.split(' ')[1]
    jwt.verify(token, process.env.TOKEN_KEY, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: 'Unauthorized' })
      }
      req.userId = decoded.id
      return next()
    })
  } catch (err) {
    return res.status(401).send({ message: 'Invalid Token' })
  }
}

const checkDuplicateUsernameOrEmail = (req, res, next) => {
  // Username
  User.findOne({ username: req.body.username }).exec((err, user) => {
    if (err) {
      res.status(500).send({ message: err.message })
      return
    }
    if (user) {
      res.status(400).send({ message: 'Username is already in use' })
      return
    }
    // Email
    User.findOne({ email: req.body.email }).exec((err, user) => {
      if (err) {
        res.status(500).send({ message: err.message })
        return
      }
      if (user) {
        res.status(400).send({ message: 'Email is already in use' })
        return
      }
      next()
    })
  })
}
export { verifyToken, checkDuplicateUsernameOrEmail }
