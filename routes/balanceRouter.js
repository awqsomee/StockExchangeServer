import { Router } from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import balanceController from '../controllers/balanceController.js'

const router = new Router()

router.put('/', authMiddleware, balanceController.changeBalance)
// router.get('/', authMiddleware, balanceController.getBalance)
// router.post('/convert', authMiddleware, balanceController.convert)
// router.delete('/', authMiddleware, balanceController.withdraw)

export default router
