const User = require('../models/User')
const balanceService = require('../services/balanceService')
const currencyService = require('../services/currencyService')
const Transaction = require('../models/Transaction')
class balanceController {
  async replenish(req, res) {
    try {
      let user = await User.findOne({ _id: req.user.id })
      const { replenish, currency } = req.body
      if (!(typeof replenish === 'number' && replenish > 0))
        return res.status(400).json({ message: 'Replenish must be positive' })
      const transaction = new Transaction({
        type: 'Пополнение',
        price: replenish,
        date: Date(),
        currency: currency,
        user: user.id,
      })
      user = balanceService.currencySwitch(user, replenish, currency)
      user.transactions.push(transaction.id)
      console.log('la kill', transaction)
      console.log('doa', user)
      await user.save()
      await transaction.save()
      return res.json({ user, message: 'Сделка прошла успешно' })
    } catch (e) {
      return res.status(400).json(e)
    }
  }
  async getBalance(req, res) {
    try {
      const user = await User.findOne({ _id: req.user.id })
      return res.json({ balanceRUB: user.balanceRUB, balanceUSD: user.balanceUSD })
    } catch (e) {
      return res.status(400).json(e)
    }
  }
  async convert(req, res) {
    try {
      console.log(req.body)
      let user = await User.findOne({ _id: req.user.id })
      const { fromCurrency, toCurrency, quantity } = req.body
      console.log(req.body)
      if (!(typeof quantity === 'number' && quantity > 0))
        return res.status(400).json({ message: 'Quantity must be positive' })
      switch (fromCurrency) {
        case 'RUB': {
          if (quantity > user.balanceRUB) res.status(400).json({ message: `Not enough ${fromCurrency}` })
          const exchangeRate = await currencyService.getCurrencyExchangeRate(fromCurrency, toCurrency)
          user = balanceService.currencySwitch(user, -quantity, fromCurrency)
          user = balanceService.currencySwitch(user, quantity * exchangeRate, toCurrency)
          break
        }
        case 'USD': {
          if (quantity > user.balanceUSD) res.status(400).json({ message: `Not enough ${fromCurrency}` })
          const exchangeRate = await currencyService.getCurrencyExchangeRate(fromCurrency, toCurrency)
          user = balanceService.currencySwitch(user, -quantity, fromCurrency)
          user = balanceService.currencySwitch(user, quantity * exchangeRate, toCurrency)
          break
        }
        default:
          throw 'Currency Error'
      }
      const transaction = new Transaction({
        type: 'Обмен',
        price: quantity,
        date: Date(),
        currency: `${fromCurrency}-${toCurrency}`,
        user: user.id,
      })
      user.transactions.push(transaction.id)
      user.save()
      transaction.save()
      return res.json({
        id: user.id,
        email: user.email,
        balanceRUB: user.balanceRUB,
        balanceUSD: user.balanceUSD,
        stocks: user.stocks,
      })
    } catch (e) {
      return res.status(400).json(e)
    }
  }
  async withdraw(req, res) {
    try {
      let user = await User.findOne({ _id: req.user.id })
      const withdraw = Number(req.query.withdraw)
      const currency = req.query.currency
      if (!withdraw > 0) return res.status(400).json({ message: 'Withdraw must be positive' })
      user = balanceService.currencySwitch(user, -withdraw, currency)
      const transaction = new Transaction({
        type: 'Снятие',
        price: withdraw,
        date: Date(),
        currency: currency,
        user: user.id,
      })
      console.log(transaction)
      user.transactions.push(transaction.id)
      await user.save()
      await transaction.save()
      return res.json({ user, message: 'Сделка прошла успешно' })
    } catch (e) {
      return res.status(400).json(e)
    }
  }
}

module.exports = new balanceController()
