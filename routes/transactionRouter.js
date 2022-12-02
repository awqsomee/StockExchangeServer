import { Router } from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import transactionController from '../controllers/transactionController.js'

const router = new Router()

router.get('', authMiddleware, transactionController.showTransactions)

export default router
