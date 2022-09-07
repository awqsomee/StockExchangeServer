import pkg from 'mongoose'
const { Schema, model, ObjectId } = pkg

const Currency = new Schema({
  symbol: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  user: { type: ObjectId, ref: 'User' },
  quantity: { type: Number, default: 0 },
})

module.exports = model('Currency', Currency)
