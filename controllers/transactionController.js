import transactionService from '../services/transactionService.js'

class TransactionController {
  async showTransactions(req, res) {
    try {
      const currentUser = req.user
      const transactions = await transactionService.showAllTransactions(currentUser)
      return res.json({
        transactions,
        message: 'Информация о транзакциях была успешно получена',
      })
    } catch (e) {
      return res.status(400).json(e)
    }
  }
}

export default new TransactionController()
