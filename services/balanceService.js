import User from '../models/User.js'
import Transaction from '../models/Transaction.js'
import doTransaction from '../utils/doTransaction.js'

class balanceService {
  async changeBalance(currentUser, value) {
    let user = await User.findOne({ _id: currentUser.id })
    if (!(typeof value === 'number')) throw { message: 'Value must be a number' }
    if (value === 0) throw { message: 'Bad request' }
    let transaction
    if (value > 0)
      transaction = new Transaction({
        type: 'Пополнение баланса',
        price: value,
        date: Date(),
        currency: 'RUB',
        user: user.id,
      })
    if (value < 0)
      transaction = new Transaction({
        type: 'Вывод средств',
        price: value,
        date: Date(),
        currency: 'RUB',
        user: user.id,
      })
    user.balance = doTransaction(user.balance, value)
    user.transactions.push(transaction.id)
    await user.save()
    await transaction.save()
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      balance: user.balance,
      transaction,
    }
  }
}

export default new balanceService()
