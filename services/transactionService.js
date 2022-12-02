import Transaction from '../models/Transaction.js'

class transactionService {
  async showAllTransactions(user) {
    const transactions = await Transaction.find({ user: user.id })
    return transactions
  }
}

export default new transactionService()
