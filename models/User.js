const { Schema, model, ObjectId } = require('mongoose')

const User = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  avatar: { type: String, default: null },
  name: { type: String, required: true },
  surname: { type: String },
  birthday: { type: Date, default: null },

  phoneNumber: { type: String, default: null },
  passportNumber: { type: String, default: null },

  paymentCards: [{ type: ObjectId, ref: 'PaymentCard' }],
  balance: { type: Number, default: 0 },

  stocks: [{ type: ObjectId, ref: 'Stock' }],
  transactions: [{ type: ObjectId, ref: 'Transactions' }],
})

module.exports = model('User', User)
