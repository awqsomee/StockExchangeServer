import express from 'express'
import mongoose from 'mongoose'
import config from 'config'
import corsMiddleware from './middleware/corsMiddleware.js'
import filepathMiddleware from './middleware/filepathMiddleware.js'
import router from './routes/router.js'
import path from 'path'
import fs from 'fs'
import fileUpload from 'express-fileupload'

const app = express()
const PORT = process.env.PORT || config.get('serverPort')
const DB_URL = config.get('dbUrl')

app.use(fileUpload({}))
app.use(corsMiddleware)
app.use(filepathMiddleware(path.join(process.cwd(), 'static')))
app.use(express.json())
app.use(express.static(path.join(process.cwd(), 'static')))
app.use(router)

const start = async () => {
  try {
    await mongoose.connect(DB_URL, { useUnifiedTopology: true, useNewUrlParser: true })
    app.listen(PORT, () => {
      console.log('Server started on port ', PORT)
      if (!fs.existsSync(path.join(process.cwd(), 'static'))) fs.mkdirSync(path.join(process.cwd(), 'static'))
    })
  } catch (e) {
    console.log(e)
  }
}

start()
