const express = require('express')
const mongoose = require('mongoose')
const config = require('config')
const authRouter = require('./routes/auth.routes')
const stockRouter = require('./routes/stock.routes')
const balanceRouter = require('./routes/balance.routes')
const stockRouterAuth = require('./routes/stock.routesAuth')
const transactionRouter = require('./routes/transaction.routes')
const corsMiddleware = require('./middleware/cors.middleware')

const app = express()
const PORT = process.env.PORT || config.get('serverPort')
const DB_URL = config.get('dbUrl')

app.use(corsMiddleware)
app.use(express.json())
app.use('/api/auth', authRouter)
app.use('/api/auth/balance', balanceRouter)
app.use('/api/stock', stockRouter)
app.use('/api/auth/stock', stockRouterAuth)
app.use('/api/auth/transactions', transactionRouter)

const start = async () => {
  try {
    mongoose.connect(DB_URL)
    app.listen(PORT, () => {
      console.log('Server started on port ', PORT)
    })
  } catch (e) {}
}

start()
