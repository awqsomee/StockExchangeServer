import pkg from 'mongoose'
const { Schema, model, ObjectId } = pkg

const Transaction = new Schema({
  type: { type: String, required: true },
  currencyId: { type: ObjectId, ref: 'Currency' },
  stcokId: { type: ObjectId, ref: 'Stock' },
  symbol: { type: String },
  price: { type: Number },
  date: { type: Date, required: true },
  amount: { type: Number },
  currency: { type: String },
  cost: { type: Number },
  user: { type: ObjectId, ref: 'User' },
  balance: { type: Number },
})

export default model('Transaction', Transaction)
