const { Schema, model, ObjectId } = require('mongoose')

const Stock = new Schema({
  symbol: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  marketOpen: { type: String, required: true },
  marketClose: { type: String, required: true },
  timezone: { type: String, required: true },
  currency: { type: String, required: true },
  price: { type: Number, required: true },
  user: { type: ObjectId, ref: 'User' },
  quantity: { type: Number, default: 0 },
})

module.exports = model('Stock', Stock)
