import stockService from '../services/stockService.js'
import Stock from '../models/Stock.js'
import User from '../models/User.js'
import stockExists from '../utils/stockExists.js'
import Transaction from '../models/Transaction.js'

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

  async buyStock(req, res) {
    try {
      const { symbol, amount } = req.body
      const currentUser = req.user
      const { stock, user, transaction } = await stockService.buyStock(symbol, amount, currentUser)
      return res.json({
        // stock,
        // user,
        // transaction,
        message: 'Сделка прошла успешно',
      })
    } catch (e) {
      console.log(e)
      return res.status(400).json(e)
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
  //     const amount = Number(request['amount'])

  //     if (amount <= 0) return res.status(400).json('Bad request')
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
  //       amount,
  //     })

  //     if (!(await stockExists(stock.symbol))) return res.status(400).json({ message: 'Stock not found' })

  //     if (!compareTime(stock)) return res.status(400).json({ message: 'Stock exchange closed' })
  //     // Пользователь, отправивший запрос
  //     let user = await User.findOne({ _id: req.user.id })
  //     const price = await stockService.getPrice(stock.symbol)
  //     stock = await stockService.buyStock(user, price * amount, stock)
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

  async getUserStocks(req, res) {
    try {
      if (!req.query.symbol) return res.json('Search query is empty')
      const symbol = req.query.symbol
      const stock = await stockExists(symbol)
      if (!stock) return res.status(400).json({ message: 'Stock not found' })
      const price = await stockService.getPrice(symbol)
      return res.json({ ...stock, price })
    } catch (e) {
      return res.status(500).json(e)
    }
  }

  async sellStock(req, res) {
    try {
      let stock = await Stock.findOne({ _id: req.query.id, user: req.user.id })
      let user = await User.findOne({ _id: req.user.id })
      if (!stock) {
        return res.status(400).json({ message: 'Stock not found' })
      }
      let amount = req.query.amount
      amount = Number(amount)
      if (amount <= 0) return res.status(400).json('Amount must be positive')
      if (amount > stock.amount) return res.status(400).json('Not enough stocks')

      const price = await stockService.getPrice(stock.symbol)

      stock = stockService.sellStock(user, stock, price, amount)
      const transaction = new Transaction({
        type: 'Продано',
        symbol: stock.symbol,
        price: price,
        date: Date(),
        amount: amount,
        currency: stock.currency,
        cost: price * amount,
        user: user.id,
      })
      user.transactions.push(transaction.id)
      if (!stock.amount) {
        await stock.remove()
        await user.save()
      } else {
        await stock.save()
        await user.save()
      }
      await transaction.save()
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
        message: 'Сделка прошла успешно',
      })
    } catch (e) {
      return res.status(400).json('Stock not found')
    }
  }
}

export default new StockController()
