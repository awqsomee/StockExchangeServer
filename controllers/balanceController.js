const { use } = require('bcrypt/promises')
const User = require('../models/User')
const balanceService = require('../services/balanceService')
const currencyService = require('../services/currencyService')

class balanceController {
  async replenish(req, res) {
    try {
      let user = await User.findOne({ _id: req.user.id })
      const { replenish, currency } = req.body
      if (!(typeof replenish === 'number' && replenish > 0))
        return res.status(400).json({ message: 'Replenish must be positive' })
      user = balanceService.currencySwitch(user, replenish, currency)
      await user.save()
      return res.json(user)
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
      let user = await User.findOne({ _id: req.user.id })
      const { fromCurrency, toCurrency, quantity } = req.body
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
      user.save()
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
      await user.save()
      return res.json(user)
    } catch (e) {
      return res.status(400).json(e)
    }
  }
}

module.exports = new balanceController()
