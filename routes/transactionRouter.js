const Router = require('express')
const authMiddleware = require('../middleware/auth.middleware')
const transactionController = require('../controllers/transactionController')

const router = new Router()

router.get('', authMiddleware, transactionController.showTransactions)

module.exports = router
