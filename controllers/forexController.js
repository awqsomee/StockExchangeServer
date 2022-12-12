import forexService from '../services/forexService.js'
class forexController {
  async getAllCurrencies(req, res) {
    try {
      const currencies = await forexService.getAllCurrencies()
      return res.json({ currencies, message: 'Список валют был успешно получен' })
    } catch (e) {
      return res.status(400).json(e)
    }
  }

  async openAccount(req, res) {
    try {
      const currentUser = req.user
      const { symbol } = req.params
      const { currency, transaction } = await forexService.openAccount(currentUser, symbol)
      return res.json({ currency, transaction, message: 'Счет был успешно открыт' })
    } catch (e) {
      return res.status(400).json(e)
    }
  }

  async closeAccount(req, res) {
    try {
      const currentUser = req.user
      const { symbol } = req.params
      const { user, transactionExchange, transactionClose, currency } = await forexService.closeAccount(
        currentUser,
        symbol
      )
      return res.json({ user, transactionExchange, transactionClose, currency, message: 'Счет был успешно закрыт' })
    } catch (e) {
      return res.status(400).json(e)
    }
  }

  async getCurrencyInfo(req, res) {
    try {
      const { symbol } = req.params
      const currency = await forexService.getCurrencyInfo(symbol)
      return res.json({ currency, message: 'Информация о валюте была успешно получена' })
    } catch (e) {
      return res.status(400).json(e)
    }
  }

  async getUserCurrencies(req, res) {
    try {
      const currentUser = req.user
      const currencies = await forexService.getUserCurrencies(currentUser)
      return res.json({ currencies, message: 'Валюты пользователя были успешно получены' })
    } catch (e) {
      return res.status(400).json(e)
    }
  }

  async exchange(req, res) {
    try {
      const currentUser = req.user
      const { symbol, amount } = req.body
      const { user, currency, currencies, transaction } = await forexService.exchangeCurrency(
        currentUser,
        symbol,
        amount
      )
      return res.json({ user, currency, currencies, transaction, message: 'Транзакция произведена' })
    } catch (e) {
      return res.status(400).json(e)
    }
  }
}

export default new forexController()
