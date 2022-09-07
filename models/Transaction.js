import pkg from 'mongoose'
const { Schema, model, ObjectId } = pkg

const Transaction = new Schema({
  type: { type: String, required: true },
  symbol: { type: String },
  price: { type: Number, required: true },
  date: { type: Date, required: true },
  quantity: { type: Number },
  currency: { type: String, required: true },
  user: { type: ObjectId, ref: 'User' },
})

export default model('Transaction', Transaction)
