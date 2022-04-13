const Router = require('express')
const authMiddleware = require('../middleware/auth.middleware')
const stockController = require('../controllers/stockController')

const router = new Router()

router.get('', authMiddleware, stockController.getStocks)

module.exports = router
