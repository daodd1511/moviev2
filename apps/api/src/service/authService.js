import User from '../model/user.js'
// import Role from '../model/role.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
// import nodemailer from 'nodemailer'
// import generator from 'generate-password'
const AuthService = {}
AuthService.Register = async (req, res) => {
  try {
    const encryptedPassword = await bcrypt.hash(req.body.password, 10)

    const user = new User({
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      username: req.body.username,
      phone: req.body.phone,
      email: req.body.email,
      password: encryptedPassword,
      gender: req.body.gender
    })

    const newUser = await user.save()
    res.status(201).send(newUser)
    // Create user in our database
  } catch (err) {
    res.send({ message: err.message })
  }
}
AuthService.Login = async (req, res) => {
  try {
    // Get user input
    User.findOne({ username: req.body.username })
      .exec((err, user) => {
        if (err) {
          res.status(500).send({ message: err })
          return
        }
        if (!user) {
          return res.status(404).send({ message: 'User not found' })
        }
        const passwordIsValid = bcrypt.compareSync(
          req.body.password,
          user.password
        )
        if (!passwordIsValid) {
          return res.status(401).send({
            accessToken: null,
            message: 'Invalid Credential!'
          })
        }
        const token = jwt.sign({ id: user._id }, process.env.TOKEN_KEY, {
          expiresIn: '30d'
        })
        res.status(200).send({
          id: user._id,
          accessToken: token
        })
      })
  } catch (err) {
    console.log(err)
  }
}
// AuthService.ForgotPassword = async (req, res) => {
//   const email = req.body.email
//   await User.findOne({ email })
//     .then(async (user) => {
//       if (!user) {
//         res.status(404).send({ message: 'User not found' })
//         return
//       }
//       const forgotPasswordToken = jwt.sign(
//         { id: user._id },
//         process.env.TOKEN_KEY,
//         { expiresIn: '1d' }
//       )
//       const transporter = nodemailer.createTransport({
//         service: 'gmail',
//         auth: {
//           user: process.env.GMAIL,
//           pass: process.env.GMAIL_PASSWORD
//         }
//       })
//       const data = {
//         from: 'Country Restaurant',
//         to: email,
//         subject: 'Reset Password',
//         html: `
//         <h3>Please click the link below to reset your password<h3>
//         <a href="https://resmanagement.herokuapp.com/api/auth/reset-pass/${forgotPasswordToken}">Reset Password</a>
//       `
//       }
//       transporter.sendMail(data, (err, body) => {
//         if (err) {
//           res.status(500).send({ message: err })
//           return
//         }
//         return res.status(200).send({
//           message: 'Email has been sent, please follow the instructions'
//         })
//       })
//     })
//     .catch((err) => {
//       res.send({ message: err.message })
//     })
// }
// AuthService.ResetPassword = (req, res) => {
//   const resetToken = req.params.token
//   if (!resetToken) {
//     return res.status(403).send('A token is required for authentication')
//   }
//   try {
//     jwt.verify(resetToken, process.env.TOKEN_KEY, async (err, decoded) => {
//       if (err) {
//         return res.status(401).send({ message: 'Invalid Token' })
//       }
//       const newPassword = generator.generate({
//         length: 10,
//         number: true
//       })
//       await User.findOne({ _id: decoded.id })
//         .populate('role')
//         .then(async (user) => {
//           const newEncryptedPassword = await bcrypt.hash(newPassword, 10)
//           user.password = newEncryptedPassword
//           await user.save()
//         })
//       const responseTemplate = `
//       <html>
//         <head>
//           <style>
//             @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500&display=swap');
//             body {
//               font-family: 'Be Vietnam Pro', sans-serif;
//             }
//             h2 {
//               text-align:center;padding-top:50px;
//             }
//           </style>
//         </head>
//         <body>
//           <h2>Your new password is: ${newPassword}</h2>
//         </body>
//       </html>
//       `
//       res.send(responseTemplate)
//     })
//   } catch (err) {
//     return res.status(401).send('Invalid Token')
//   }
// }
export default AuthService
