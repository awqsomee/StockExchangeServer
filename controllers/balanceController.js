const User = require('../models/User')
const balanceService = require('../services/balanceService')

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
  async withdraw(req, res) {
    try {
      let user = await User.findOne({ _id: req.user.id })
      const withdraw = Number(req.query.withdraw)
      console.log(req.query.currency)
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
