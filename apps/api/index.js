import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import morgan from 'morgan'
import connectDatabase from './src/config/db.config.js'
import { verifyToken } from './src/middleware/auth.middleware.js'
import router from './src/router/router.js'
dotenv.config()
connectDatabase()
const app = express()
app.use(helmet()).use(morgan('dev')).use(cors()).use(express.json())

// Unauthenticated and DB-independent on purpose: this answers "is the process up",
// which is what the deploy gate and the container HEALTHCHECK ask. It stays green if
// Mongo is down, so monitor a real data route separately.
app.get('/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.use('/api', router)
app.get('/', verifyToken, (req, res) => {
  res.send('Hello from movie backend')
})

const port = process.env.PORT || 4000
app.listen(port, () => {
  console.log(`Server is listening on PORT: ${port}`)
})
