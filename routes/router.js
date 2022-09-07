import { Router } from 'express'
import authRouter from './authRouter.js'
import balanceRouter from './balanceRouter.js'

const router = new Router()
router.use('/api/auth', authRouter)
router.use('/api/auth/balance', balanceRouter)
// router.use('/api/stock', stockRouter)
// router.use('/api/auth/stock', stockRouterAuth)
// router.use('/api/auth/transactions', transactionRouter)

export default router
