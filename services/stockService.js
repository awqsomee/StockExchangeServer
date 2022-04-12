const axios = require('axios')
const config = require('config')
const Stock = require('../models/Stock')
const compareTime = require('../utils/compareTime')
const balanceService = require('./balanceService')

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
  async getPrice(symbol) {
    try {
      const response = await axios.get(
        `${config.get('AV')}/query?${config.get('intradayTS')}${symbol}${config.get('apiKey')}`
      )
      if (!response.data['Time Series (5min)']) throw 'Bad request'
      const dailyStockPrices = response.data['Time Series (5min)']
      const dates = Object.keys(dailyStockPrices)
      const currentPrice = dailyStockPrices[dates[0]]['4. close']
      return currentPrice
    } catch (e) {
      console.log(e)
      return { message: 'Could not get stock price' }
    }
  }
}

module.exports = new StockService()
