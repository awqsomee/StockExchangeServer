const Stock = require('../models/Stock')
const compareTime = require('../utils/compareTime')
const balanceService = require('./balanceService')
const getPrice = require('../utils/getPrice')

class StockService {
  async buyStock(user, cost, stock) {
    if (cost > 0) {
      user = balanceService.currencySwitch(user, -cost, stock.currency)
      // Уже купленные акции
      const purchasedStock = await Stock.findOne({ symbol: stock.symbol, user: user.id })
      if (purchasedStock) {
        purchasedStock.quantity += stock.quantity
        stock = purchasedStock
      }
      return stock
    } else return { message: 'Bad requested' }
  }

  sellStock(user, stock, price, quantity) {
    if (compareTime(stock)) {
      user = balanceService.currencySwitch(user, price * quantity, stock.currency)
      stock.quantity -= quantity
      return stock
    } else {
      throw 'Stock exchange is closed'
    }
  }
}

module.exports = new StockService()
