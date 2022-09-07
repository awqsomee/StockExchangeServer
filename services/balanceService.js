import User from '../models/User.js'
import Transaction from '../models/Transaction.js'

class balanceService {
  async changeBalance(currentUser, value) {
    let user = await User.findOne({ _id: currentUser.id })
    if (!(typeof value === 'number')) throw 'Value must be a number'
    let transaction
    if (value > 0)
      transaction = new Transaction({
        type: 'REPLENISHMENT',
        price: value,
        date: Date(),
        currency: 'RUB',
        user: user.id,
      })
    if (value < 0)
      transaction = new Transaction({
        type: 'WITHDRAWAL',
        price: value,
        date: Date(),
        currency: 'RUB',
        user: user.id,
      })
    user.balance = this.doTransaction(user.balance, value)
    user.transactions.push(transaction.id)
    await user.save()
    await transaction.save()
    return {
      id: user.id,
      name: user.name,
      balance: user.balance,
    }
  }
  // currencySwitch(user, cost, currency) {
  //   switch (currency) {
  //     case 'RUB': {
  //       user.balanceRUB = this.transaction(user.balanceRUB, cost)
  //       return user
  //     }
  //     case 'USD': {
  //       user.balanceUSD = this.transaction(user.balanceUSD, cost)
  //       return user
  //     }
  //     default:
  //       throw 'Currency Error'
  //   }
  // }
  doTransaction(balance, amount) {
    if (balance >= -amount || amount > 0) {
      balance += amount
    } else throw 'Not enough money'
    return balance
  }
}

export default new balanceService()
