import stockService from '../services/stockService.js'
import stockExists from '../utils/stockExists.js'

class StockController {
  async getStockInfo(req, res) {
    try {
      const { symbol, from, till } = req.query
      const stock = await stockService.getStockInfo(symbol, from, till)
      return res.json({
        stock,
        message: 'Данные успешно получены',
      })
    } catch (e) {
      return res.status(500).json(e)
    }
  }

  async findStock(req, res) {
    try {
      const { q } = req.query
      const stock = await stockService.findStock(q)
      return res.json({
        stock,
        message: 'Данные успешно получены',
      })
    } catch (e) {
      return res.status(500).json(e)
    }
  }

  async exchangeStock(req, res) {
    try {
      const { symbol, amount } = req.body
      const currentUser = req.user
      const { stock, user, transaction } = await stockService.exchangeStock(symbol, amount, currentUser)
      return res.json({
        stock,
        user,
        transaction,
        message: 'Сделка прошла успешно',
      })
    } catch (e) {
      return res.status(500).json(e)
    }
  }

  async getUserStocks(req, res) {
    try {
      const currentUser = req.user
      const stocks = await stockService.getUserStocks(currentUser)
      return res.json({
        stocks,
        message: 'Акции пользователя успешно получены',
      })
    } catch (e) {
      return res.status(500).json(e)
    }
  }
}

export default new StockController()
