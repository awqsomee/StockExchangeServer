class balanceService {
  currencySwitch(user, cost, currency) {
    switch (currency) {
      case 'RUB': {
        user.balanceRUB = this.transaction(user.balanceRUB, cost)
        return user
      }
      case 'USD': {
        user.balanceUSD = this.transaction(user.balanceUSD, cost)
        return user
      }
      default:
        throw 'Currency Error'
    }
  }
  transaction(balance, amount) {
    if (balance >= -amount || amount > 0) {
      balance += amount
    } else throw 'Not enough money'
    return balance
  }
}

module.exports = new balanceService()
