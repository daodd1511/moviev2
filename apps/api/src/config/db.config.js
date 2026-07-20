import mongoose from 'mongoose'
const connectDatabase = () => {
  console.log(`Connecting to ${process.env.MONGO_URI}`)
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    .then(() => {
      console.log('Successfully connected to the database')
    })
    .catch((err) => {
      console.log(`Could not connect to the database. Exiting now...\n${err}`)
      process.exit()
    })
}
export default connectDatabase
