const axios = require('axios')
const config = require('config')
const Stock = require('../models/Stock')
const stockService = require('../services/stockService')
const compareTime = require('../utils/compareTime')
const User = require('../models/User')
const stockExists = require('../utils/stockExists')
const { response } = require('express')

class StockController {
  async buyStock(req, res) {
    try {
      const { symbol, quantity } = req.body
      if (quantity <= 0) return res.status(400).json('Bad request')
      const response = await stockExists(symbol)
      if (!response) return res.status(400).json({ message: 'Stock not found' })
      // Получаем данные из Alpha Vantage API
      const name = response['2. name']
      const marketOpen = response['5. marketOpen']
      const marketClose = response['6. marketClose']
      const timezone = response['7. timezone']
      const currency = response['8. currency']

      // Записываем данные в модель акции

      let stock = new Stock({
        symbol,
        name,
        marketOpen,
        marketClose,
        timezone,
        currency,
        user: req.user.id,
        quantity,
      })

      // if (!compareTime(stock)) return res.status(400).json({ message: 'Stock exchange closed' })
      // Пользователь, отправивший запрос
      let user = await User.findOne({ _id: req.user.id })
      const price = await stockService.getPrice(stock.symbol)
      stock = await stockService.buyStock(user, price * quantity, stock)
      if (!stock.symbol) return res.status(400).json({ message: 'aplhavangage.com error' })
      await stock.save()
      await user.save()
      return res.json({
        stock,
        user: {
          id: user.id,
          email: user.email,
          balanceRUB: user.balanceRUB,
          balanceUSD: user.balanceUSD,
          stocks: user.stocks,
        },
        price,
      })
    } catch (e) {
      console.log(e)
      return res.json(e.message)
    }
  }

  // async buyStock(req, res) {
  //   try {
  //     // Получаем данные из Alpha Vantage API
  //     const request = req.body
  //     const symbol = request['1. symbol']
  //     const name = request['2. name']
  //     const type = request['3. type']
  //     const region = request['4. region']
  //     const marketOpen = request['5. marketOpen']
  //     const marketClose = request['6. marketClose']
  //     const timezone = request['7. timezone']
  //     const currency = request['8. currency']
  //     const quantity = Number(request['quantity'])

  //     if (quantity <= 0) return res.status(400).json('Bad request')
  //     // Записываем данные в модель акции
  //     let stock = new Stock({
  //       symbol,
  //       name,
  //       type,
  //       region,
  //       marketOpen,
  //       marketClose,
  //       timezone,
  //       currency,
  //       user: req.user.id,
  //       quantity,
  //     })

  //     if (!(await stockExists(stock.symbol))) return res.status(400).json({ message: 'Stock not found' })

  //     if (!compareTime(stock)) return res.status(400).json({ message: 'Stock exchange closed' })
  //     // Пользователь, отправивший запрос
  //     let user = await User.findOne({ _id: req.user.id })
  //     const price = await stockService.getPrice(stock.symbol)
  //     stock = await stockService.buyStock(user, price * quantity, stock)
  //     await stock.save()
  //     await user.save()
  //     return res.json({
  //       stock,
  //       user: {
  //         id: user.id,
  //         email: user.email,
  //         balanceRUB: user.balanceRUB,
  //         balanceUSD: user.balanceUSD,
  //         stocks: user.stocks,
  //       },
  //       price,
  //     })
  //   } catch (e) {
  //     return res.status(500).json(e)
  //   }
  // }

  async getStocks(req, res) {
    try {
      if (req.query.symbol) {
        const stock = await stockExists(req.query.symbol)
        if (!stock) return res.status(400).json({ message: 'Stock not found' })
        const price = await stockService.getPrice(req.query.symbol)
        return res.json({ ...stock, price })
      }
      const stocks = await Stock.find({ user: req.user.id })
      return res.json(stocks)
    } catch (e) {
      console.log(e)
      return res.status(500).json(e.message)
    }
  }

  async sellStock(req, res) {
    try {
      let stock = await Stock.findOne({ _id: req.query.id, user: req.user.id })
      let user = await User.findOne({ _id: req.user.id })
      let quantity = req.query.quantity
      quantity = Number(quantity)
      if (quantity <= 0) return res.status(400).json('Quantity must be positive')
      if (quantity > stock.quantity) return res.status(400).json('Not enough stocks')
      if (!stock) {
        return res.status(400).json({ message: 'Stock not found' })
      }
      const price = await stockService.getPrice(stock.symbol)
      stock = stockService.sellStock(user, stock, price, quantity)
      if (!stock.quantity) {
        await stock.remove()
        await user.save()
      } else {
        await stock.save()
        await user.save()
      }
      return res.json({
        stock,
        user: {
          id: user.id,
          email: user.email,
          balanceRUB: user.balanceRUB,
          balanceUSD: user.balanceUSD,
          stocks: user.stocks,
        },
        price,
      })
    } catch (e) {
      return res.status(400).json('Stock not found')
    }
  }
}

module.exports = new StockController()
