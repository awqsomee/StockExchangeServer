const express = require('express')
const mongoose = require('mongoose')
const config = require('config')
const corsMiddleware = require('./middleware/cors.middleware')
const router = require('./routes/router')

const app = express()
const PORT = process.env.PORT || config.get('serverPort')
const DB_URL = config.get('dbUrl')

app.use(corsMiddleware)
app.use(express.json())
app.use(router)

const start = async () => {
  try {
    mongoose.connect(DB_URL)
    app.listen(PORT, () => {
      console.log('Server started on port ', PORT)
    })
  } catch (e) {}
}

start()
