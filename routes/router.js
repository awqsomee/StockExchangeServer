import { Router } from 'express'
import authRouter from './authRouter.js'
import balanceRouter from './balanceRouter.js'
import forexRouter from './forexRouter.js'
import stockRouter from './stockRouter.js'
import transactionRouter from './transactionRouter.js'
import userRouter from './userRouter.js'

const router = new Router()
router.use('/api/auth', authRouter)
router.use('/api/auth/balance', balanceRouter)
router.use('/api/forex', forexRouter)
router.use('/api/stocks', stockRouter)
router.use('/api/auth/transactions', transactionRouter)
router.use('/api/auth/user', userRouter)

export default router
