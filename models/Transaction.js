const { Schema, model, ObjectId } = require('mongoose')

const Transaction = new Schema({
  type: { type: String, required: true },
  symbol: { type: String },
  amount: { type: Number, required: true },
  date: { type: Data, required: true },
  quantity: { type: Number, default: 0 },
  currency: { type: String, required: true },
  user: { type: ObjectId, ref: 'User' },
})

module.exports = model('Transaction', Transaction)
