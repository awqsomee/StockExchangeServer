import { Router } from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import stockController from '../controllers/stockController.js'

const router = new Router()

// TODO: Cash data
router.get('', stockController.getStockInfo)
router.get('/search', stockController.findStock)
router.post('/auth', authMiddleware, stockController.buyStock)
router.get('/auth', authMiddleware, stockController.getUserStocks)
router.delete('/auth/', authMiddleware, stockController.sellStock)

export default router
