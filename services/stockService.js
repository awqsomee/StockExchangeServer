import axios from 'axios'
import Stock from '../models/Stock.js'
import User from '../models/User.js'
import Transaction from '../models/Transaction.js'
import doTransaction from '../utils/doTransaction.js'
import url from 'url'

class StockService {
  async exchangeStock(symbol, amount, currentUser) {
    if (!symbol || !amount) throw { message: 'Некорректный запрос' }
    if (amount == 0) throw { message: 'Некорректный запрос' }
    let user = await User.findOne({ _id: currentUser.id })
    const stockInfo = await this.getStockInfo(symbol)
    const price = stockInfo.prices[0].close
    if (!price) throw { message: 'Акция не продается' }
    let stock = await Stock.findOne({ user: currentUser.id, symbol })
    if (!stock?.symbol) {
      if (amount < 0) throw { message: 'У вас нет такого количества акций' }
      stock = new Stock({
        symbol,
        name: stockInfo.name,
        shortname: stockInfo.shortname,
        currency: stockInfo.currency,
        latestPrice: stockInfo.prices[0].close,
        user: user.id,
        amount,
      })
      user.stocks.push(stock.id)
    } else {
      if (amount < 0 && stock.amount < -amount)
        throw { message: 'У вас нет такого количества акций' }
      stock.amount += amount
    }

    if (stock.currency != 'RUB')
      throw { message: 'Покупка и продажа акций в валюте находится в разработке' }
    user.balance = doTransaction(user.balance, -price * amount)
    const transaction = new Transaction({
      type: 'Обмен акций',
      symbol: stock.symbol,
      price: price,
      date: Date(),
      amount: amount,
      currency: stock.currency,
      cost: price * amount,
      balance: user.balance,
      user: user.id,
    })
    user.transactions.push(transaction.id)
    await stock.save()
    await user.save()
    await transaction.save()

    if (stock.amount === 0) {
      user.stocks.pop(stock.id)
      await Stock.deleteOne({ _id: stock.id })
      await user.save()
    }

    return {
      stock: {
        id: stock.id,
        symbol: stock.symbol,
        name: stock.name,
        shortname: stockInfo.shortname,
        currency: stock.currency,
        latestPrice: stock.latestPrice,
        amount: stock.amount,
        prices: stockInfo.prices,
      },
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        balance: user.balance,
        stocks: user.stocks,
      },
      transaction,
    }
  }

  async getStockInfo(symbol, from, till) {
    if (!symbol) throw { message: 'Некорректный запрос' }
    const URI = `https://iss.moex.com/iss/securities/${symbol}.json`
    const encodedURI = encodeURI(URI)
    const response = await axios.get(encodedURI)
    const data = response.data.description.data
    if (Object.keys(data).length != 0) {
      if (response.data.description.data[0][2] === symbol) {
        const engine = response.data.boards.data[0][7]
        const market = response.data.boards.data[0][5]
        const board = response.data.boards.data[0][1]
        const currency = response.data.boards.data[0][15]
        let pricesData
        if (from && !till) {
          pricesData = await axios.get(
            `https://iss.moex.com/iss/history/engines/${engine}/markets/${market}/sessions/total/boards/${board}/securities/${symbol}.json?sort_order=desc&from=${from}`
          )
        } else if (till && !from) {
          pricesData = await axios.get(
            `https://iss.moex.com/iss/history/engines/${engine}/markets/${market}/sessions/total/boards/${board}/securities/${symbol}.json?sort_order=desc&till=${till}`
          )
        } else if (from && till) {
          pricesData = await axios.get(
            `https://iss.moex.com/iss/history/engines/${engine}/markets/${market}/sessions/total/boards/${board}/securities/${symbol}.json?sort_order=desc&from=${from}&till=${till}`
          )
        } else {
          pricesData = await axios.get(
            `https://iss.moex.com/iss/history/engines/${engine}/markets/${market}/sessions/total/boards/${board}/securities/${symbol}.json?sort_order=desc`
          )
        }
        const prices = pricesData.data.history.data.map((stroke) => {
          return {
            date: stroke[1],
            open: stroke[6],
            close: stroke[11],
            low: stroke[7],
            high: stroke[8],
          }
        })

        return {
          symbol: data[0][2],
          name: data[1][2],
          shortname: data[2][2],
          isin: data[3][2],
          issuesize: data[5][2],
          facevalue: data[6][2],
          faceunit: data[7][2],
          issuedate: data[8][2],
          latname: data[9][2],
          isqualifiedinvestors: data[10][2],
          typename: data[11][2],
          group: data[12][2],
          type: data[13][2],
          groupname: data[14][2],
          engine,
          market,
          board,
          currency,
          prices,
        }
      }
    } else {
      throw { message: 'Акций не найдено' }
    }
  }

  async findStock(query) {
    if (!query) throw { message: 'Поле поиска пустое' }
    const URI = `https://iss.moex.com/iss/securities.json?q=${query}`
    const encodedURI = encodeURI(URI)
    const response = await axios.get(encodedURI)
    const data = response.data.securities.data
    if (Object.keys(data).length != 0) {
      let result = await Promise.all(
        Object.values(data).map(async (stroke) => {
          const boardid = stroke[14]
          const symbol = stroke[1]
          if (boardid == 'TQBR' || boardid == 'FQBR') {
            const stock = await this.getStockInfo(symbol)
            stock.isTraded = stroke[6]
            return stock
          }
        })
      )
      result = result.filter((value) => value != null)
      if (result.length == 0) throw { message: 'Акции не найдены' }
      if (result != null) return result
    } else {
      throw { message: 'Акции не найдены' }
    }
  }

  async getUserStocks(currentUser) {
    let stocks = await Stock.find({ user: currentUser.id })
    stocks = await Promise.all(
      stocks.map(async (stock) => {
        const share = await this.getStockInfo(stock.symbol)
        return {
          id: stock.id,
          symbol: stock.symbol,
          name: stock.name,
          shortname: stock.shortname,
          currency: stock.currency,
          latestPrice: stock.latestPrice,
          amount: stock.amount,
          prices: share.prices,
        }
      })
    )
    return stocks
  }
}

export default new StockService()
