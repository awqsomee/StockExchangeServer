import pkg from 'mongoose'
const { Schema, model, ObjectId } = pkg

const Currency = new Schema({
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  user: { type: ObjectId, ref: 'User' },
  amount: { type: Number, default: 0 },
  latestPrice: { type: Number, required: true },
})

export default model('Currency', Currency)
