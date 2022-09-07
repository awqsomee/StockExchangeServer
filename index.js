import express from 'express'
import mongoose from 'mongoose'
import config from 'config'
import corsMiddleware from './middleware/corsMiddleware.js'
import router from './routes/router.js'

const app = express()
const PORT = process.env.PORT || config.get('serverPort')
const DB_URL = config.get('dbUrl')

app.use(corsMiddleware)
app.use(express.json())
app.use(router)

const start = async () => {
  try {
    await mongoose.connect(DB_URL, { useUnifiedTopology: true, useNewUrlParser: true })
    app.listen(PORT, () => {
      console.log('Server started on port ', PORT)
    })
  } catch (e) {
    console.log(e)
  }
}

start()
