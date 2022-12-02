import axios from 'axios'
import config from 'config'
import Stock from '../models/Stock.js'
import balanceService from './balanceService.js'
import User from '../models/User.js'

class StockService {
  async buyStock(symbol, amount, currentUser) {
    if (amount <= 0) throw { message: 'Bad request' }
    let user = await User.findOne({ _id: currentUser.id })
    const stockInfo = await this.getStockInfo(symbol)
    let stock = new Stock({
      symbol,
      name: stockInfo.name,
      currency: stockInfo.faceunit,
      user: currentUser,
      amount,
    })
    return stock
    // // if (!compareTime(stock)) return res.status(400).json({ message: 'Stock exchange closed' })
    // const price = await this.getPrice(symbol)
    // if (!price) return res.status(400).json({ message: price })
    // // stock = await stockService.buyStock(user, price * amount, stock)
    // if (!stock.symbol) return res.status(400).json({ message: stock })
    // stock.price = price
    // const transaction = new Transaction({
    //   type: 'Куплено',
    //   symbol: stock.symbol,
    //   price: price,
    //   date: Date(),
    //   amount: amount,
    //   currency: stock.currency,
    //   cost: price * amount,
    //   user: user.id,
    // })
    // user.transactions.push(transaction.id)
    // await stock.save()
    // await user.save()
    // await transaction.save()

    // if (cost > 0) {
    //   user = balanceService.currencySwitch(user, -cost, stock.currency)
    //   user.stocks.push(stock.id)
    //   if (!user.id) throw user
    //   // Уже купленные акции
    //   const purchasedStock = await Stock.findOne({ symbol: stock.symbol, user: user.id })
    //   if (purchasedStock) {
    //     purchasedStock.amount += stock.amount
    //     stock = purchasedStock
    //   }
    // return stock
    // } else throw {message: 'Bad request'}
  }

  sellStock(user, stock, price, amount) {
    // if (compareTime(stock)) {
    user = balanceService.currencySwitch(user, price * amount, stock.currency)
    stock.amount -= amount
    return stock
    // } else {
    //   throw 'Stock exchange is closed'
    // }
  }

  async getPrice(symbol) {
    try {
      const response = await axios.get(`${config.get('finnhub.quote')}${symbol}&token=${config.get('finnhub.APIKey')}`)
      if (!response.data.c) throw 'Stock Price Error'
      const currentPrice = response.data.c
      return currentPrice
    } catch (e) {
      throw e
    }
  }

  async getStockInfo(symbol, from, till) {
    if (!symbol) throw { message: 'Bad request' }
    const response = await axios.get(`https://iss.moex.com/iss/securities/${symbol}.json`)
    const data = response.data.description.data
    if (Object.keys(data).length != 0) {
      if (response.data.description.data[0][2] === symbol) {
        const engine = response.data.boards.data[0][7]
        const market = response.data.boards.data[0][5]
        const board = response.data.boards.data[0][1]
        const currency = response.data.boards.data[0][15]
        let pricesData
        console.log(
          `https://iss.moex.com/iss/history/engines/${engine}/markets/${market}/sessions/total/boards/${board}/securities/${symbol}.json?sort_order=desc&from=${from}&till=${till}`
        )
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
          secid: data[0][2],
          name: data[1][2],
          shortname: data[2][2],
          isin: data[3][2],
          issuesize: data[4][2],
          facevalue: data[5][2],
          faceunit: data[6][2],
          issuedate: data[7][2],
          latname: data[8][2],
          isqualifiedinvestors: data[9][2],
          typename: data[10][2],
          group: data[11][2],
          type: data[12][2],
          groupname: data[13][2],
          emitterId: data[14][2],
          engine,
          market,
          board,
          currency,
          prices,
        }
      }
    } else {
      throw { message: 'Stock not found' }
    }
  }

  async findStock(query) {
    if (!query) throw { message: 'Bad request' }
    const response = await axios.get(`https://iss.moex.com/iss/securities.json?q=${query}`)
    const data = response.data.securities.data
    if (Object.keys(data).length != 0) {
      let result = Object.values(data).map((stroke) => {
        if (stroke[5]) {
          return {
            secid: stroke[1],
            shortname: stroke[2],
            name: stroke[4],
            isin: stroke[5],
            is_traded: stroke[6],
            emitent_title: stroke[8],
            type: stroke[11],
            group: stroke[12],
            primary_boardid: stroke[13],
          }
        }
      })
      result = result.filter((value) => value != null)
      if (result != null) return result
    } else {
      throw { message: 'Stock not found' }
    }
  }
}

export default new StockService()
