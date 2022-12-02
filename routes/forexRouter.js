import { Router } from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import forexController from '../controllers/forexController.js'

const router = new Router()

router.get('/', forexController.getAllCurrencies)
router.post('/auth/:symbol/open', authMiddleware, forexController.openAccount)
router.post('/auth/:symbol/close', authMiddleware, forexController.closeAccount)
router.post('/auth', authMiddleware, forexController.exchange)
router.get('/auth', authMiddleware, forexController.getUserCurrencies)
router.get('/:symbol', forexController.getCurrencyInfo)

export default router
