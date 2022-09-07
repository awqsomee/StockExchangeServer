const axios = require('axios')
const config = require('config')
const Stock = require('../models/Stock')
const compareTime = require('../utils/compareTime')
const balanceService = require('./balanceService')

class currencyService {
  async getCurrencyExchangeRate(fromCurrency, toCurrency) {
    try {
      const response = await axios.get(
        `${config.get('AV')}/query?${config.get(
          'currencyER'
        )}&from_currency=${fromCurrency}&to_currency=${toCurrency}${config.get('apiKey')}`
      )
      const exchangeRate = response.data['Realtime Currency Exchange Rate']['5. Exchange Rate']
      return exchangeRate
    } catch (e) {
      console.log(e)
      return { message: 'Could not get exchange rate' }
    }
  }
}

module.exports = new currencyService()
