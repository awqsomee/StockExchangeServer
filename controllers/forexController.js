import forexService from '../services/forexService.js'
class forexController {
  async getAllCurrencies(req, res) {
    try {
      const currencies = await forexService.getAllCurrencies()
      return res.json({ currencies, message: 'Currencies have been recieved' })
    } catch (e) {
      return res.status(400).json(e)
    }
  }

  async openAccount(req, res) {
    try {
      const currentUser = req.user
      const { symbol } = req.params
      const { currency, transaction } = await forexService.openAccount(currentUser, symbol)
      return res.json({ currency, transaction, message: 'Account has been opened' })
    } catch (e) {
      return res.status(400).json(e)
    }
  }

  async closeAccount(req, res) {
    try {
      const currentUser = req.user
      const { symbol } = req.params
      const user = await forexService.closeAccount(currentUser, symbol)
      return res.json({ user, message: 'Account has been closed' })
    } catch (e) {
      return res.status(400).json(e)
    }
  }

  async getCurrencyInfo(req, res) {
    try {
      const { symbol } = req.params
      const currency = await forexService.getCurrencyInfo(symbol)
      return res.json({ currency, message: 'Currency info has been recieved' })
    } catch (e) {
      return res.status(400).json(e)
    }
  }

  async getUserCurrencies(req, res) {
    try {
      const currentUser = req.user
      const currencies = await forexService.getUserCurrencies(currentUser)
      return res.json({ currencies, message: 'Currencies have been recieved' })
    } catch (e) {
      return res.status(400).json(e)
    }
  }

  async exchange(req, res) {
    try {
      const currentUser = req.user
      const { symbol, amount } = req.body
      const user = await forexService.exchangeCurrency(currentUser, symbol, amount)
      return res.json({ user, message: 'Transaction completed' })
    } catch (e) {
      return res.status(400).json(e)
    }
  }
}

export default new forexController()
