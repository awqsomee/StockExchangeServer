import axios from 'axios'
import User from '../models/User.js'
import Currency from '../models/Currency.js'
import Transaction from '../models/Transaction.js'
import doTransaction from '../utils/doTransaction.js'

class forexService {
  async getAllCurrencies() {
    const response = await axios.get(`https://www.cbr-xml-daily.ru/daily_json.js`)

    let valutes = Object.keys(response.data.Valute)
    let valutesWithPrices = {}
    valutes.forEach((valute) => {
      valutesWithPrices[valute] = {
        name: response.data.Valute[valute].Name,
        value: response.data.Valute[valute].Value / response.data.Valute[valute].Nominal,
        previous: response.data.Valute[valute].Previous / response.data.Valute[valute].Nominal,
      }
    })

    return valutesWithPrices
  }

  async openAccount(currentUser, symbol) {
    let user = await User.findOne({ _id: currentUser.id })

    let currency = await Currency.findOne({ user: currentUser.id, symbol })
    if (currency?.id) throw { message: 'Account already opened' }

    const currencyInfo = await this.getCurrencyInfo(symbol)
    currency = new Currency({
      symbol,
      name: currencyInfo.Name,
      user: user.id,
      amount: 0,
      latestPrice: currencyInfo.Value / currencyInfo.Nominal,
    })

    const transaction = new Transaction({
      type: 'Открытие счета',
      symbol: currency.symbol,
      date: Date(),
      user: user.id,
    })

    user.transactions.push(transaction.id)
    user.currencies.push(currency.id)

    await user.save()
    await transaction.save()
    await currency.save()

    return { transaction, currency }
  }

  async closeAccount(currentUser, symbol) {
    let user = await User.findOne({ _id: currentUser.id })

    let currency = await Currency.findOne({ user: currentUser.id, symbol })
    if (!currency?.id) throw { message: 'Account already closed' }
    let transactionExchange
    if (currency.amount > 0) {
      const exchangeResult = await this.exchange(user, symbol, currency.amount * -1)
      user = exchangeResult.user
      currency = exchangeResult.currency
      transactionExchange = exchangeResult.transaction
    }

    const transactionClose = new Transaction({
      type: 'Закрытие счета',
      symbol: currency.symbol,
      date: Date(),
      user: user.id,
    })
    user.transactions.push(transactionClose.id)
    user.currencies.pop(currency.id)

    await user.save()
    if (transactionExchange) await transactionExchange.save()
    await currency.save()
    await transactionClose.save()
    await Currency.deleteOne({ _id: currency.id })

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      transactionExchange,
      transactionClose,
      currency,
      balance: user.balance,
    }
  }

  async getCurrencyInfo(symbol) {
    const response = await axios.get(`https://www.cbr-xml-daily.ru/daily_json.js`)
    if (!response.data.Valute[symbol]) throw { message: 'Currency have not been found' }

    return response.data.Valute[symbol]
  }

  async getUserCurrencies(currentUser) {
    let currencies = await Currency.find({ user: currentUser.id })
    const allCurrencies = await this.getAllCurrencies()
    currencies = currencies.map((currency) => {
      return {
        _id: currency._id,
        symbol: currency.symbol,
        name: currency.name,
        user: currency._userid,
        amount: currency.amount,
        latestPrice: currency.latestPrice,
        price: allCurrencies[currency.symbol].value,
        difference: (allCurrencies[currency.symbol].value - currency.latestPrice) * currency.amount,
      }
    })
    return currencies
  }

  async exchangeCurrency(currentUser, symbol, amount) {
    let user = await User.findOne({ _id: currentUser.id })

    const exchangeResult = await this.exchange(user, symbol, amount)
    user = exchangeResult.user
    const { currency, transaction } = exchangeResult

    await user.save()
    await transaction.save()
    await currency.save()

    let currencies = await Currency.find({ user: currentUser.id })

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      transaction,
      currencies,
      currency,
      balance: user.balance,
    }
  }

  async exchange(user, symbol, amount) {
    if (!(typeof amount === 'number')) throw { message: 'Amount must be a number' }
    if (amount === 0) throw { message: 'Bad request' }
    amount = Math.floor(amount)

    const currencyInfo = await this.getCurrencyInfo(symbol)
    let currency = await Currency.findOne({ user: user._id, symbol })
    if (!currency?.id) throw { message: 'You must open account first' }

    currency.amount += amount
    if (currency.amount < 0) throw { message: 'Not enough currency' }

    currency.latestPrice = currencyInfo.Value / currencyInfo.Nominal

    let transaction
    if (amount > 0) {
      transaction = new Transaction({
        type: 'Обмен валюты',
        symbol: currency.symbol,
        price: currency.latestPrice,
        date: Date(),
        amount,
        currency: 'RUB',
        cost: currency.latestPrice * amount,
        user: user.id,
      })
    }
    if (amount < 0)
      transaction = new Transaction({
        type: 'Обмен валюты',
        symbol: currency.symbol,
        price: currency.latestPrice,
        date: Date(),
        amount,
        currency: 'RUB',
        cost: currency.latestPrice * amount,
        user: user.id,
      })

    user.balance = doTransaction(user.balance, (currencyInfo.Value * -amount) / currencyInfo.Nominal)
    user.transactions.push(transaction.id)

    return { user, currency, transaction }
  }
}

export default new forexService()
