import pkg from 'mongoose'
const { Schema, model, ObjectId } = pkg

const Transaction = new Schema({
  type: { type: String, required: true },
  symbol: { type: String },
  price: { type: Number },
  date: { type: Date, required: true },
  amount: { type: Number },
  currency: { type: String },
  cost: { type: Number },
  user: { type: ObjectId, ref: 'User' },
})

export default model('Transaction', Transaction)
