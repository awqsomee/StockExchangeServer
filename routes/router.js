const { Router } = require('express')
const authRouter = require('./auth.routes')
const stockRouter = require('./stock.routes')
const balanceRouter = require('./balance.routes')
const stockRouterAuth = require('./stock.routesAuth')
const transactionRouter = require('./transaction.routes')

const router = new Router()
router.use('/api/auth', authRouter)
router.use('/api/auth/balance', balanceRouter)
router.use('/api/stock', stockRouter)
router.use('/api/auth/stock', stockRouterAuth)
router.use('/api/auth/transactions', transactionRouter)

module.exports = router
