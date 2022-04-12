const { Schema, model, ObjectId } = require('mongoose')

const User = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  avatar: { type: String, default: null },
  name: { type: String, required: true },
  surname: { type: String, required: true },
  birthday: { type: Date, default: null },

  phoneNumber: { type: String, default: null },
  passportNumber: { type: String, default: null },

  paymentCards: { type: ObjectId, ref: 'PaymentCard' },
  balanceRUB: { type: Number, default: 0 },
  balanceUSD: { type: Number, default: 0 },

  stocks: { type: ObjectId, ref: 'Stock' },
})

module.exports = model('User', User)
