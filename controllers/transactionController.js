const Transaction = require('../models/Transaction')
const User = require('../models/User')

class TransactionController {
  async showTransactions(req, res) {
    try {
      const transactions = await Transaction.find({ user: req.user.id })
      console.log(transactions)
      return res.json({
        user: req.user.id,
        transactions,
      })
    } catch (e) {
      console.log(e)
    }
  }
}

module.exports = new TransactionController()
