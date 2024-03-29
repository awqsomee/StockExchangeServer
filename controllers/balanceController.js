import balanceService from '../services/balanceService.js'
// const currencyService = require('../services/currencyService')
class balanceController {
  async changeBalance(req, res) {
    try {
      const { value } = req.body
      const currentUser = req.user
      const {user, transaction} = await balanceService.changeBalance(currentUser, value)
      return res.json({ user, transaction, message: 'Транзакция произведена' })
    } catch (e) {
      return res.status(400).json(e)
    }
  }
}

export default new balanceController()
