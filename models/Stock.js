import pkg from 'mongoose'
const { Schema, model, ObjectId } = pkg

const Stock = new Schema({
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  shortname: { type: String, required: true },
  latname: { type: String, required: true },
  currency: { type: String, required: true },
  latestPrice: { type: Number, required: true },
  user: { type: ObjectId, ref: 'User' },
  amount: { type: Number, default: 0 },
  // marketOpen: { type: String, required: true },
  // marketClose: { type: String, required: true },
  // timezone: { type: String, required: true },
})

export default model('Stock', Stock)
