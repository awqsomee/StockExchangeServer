const { Schema, model, ObjectId } = require('mongoose')

const PaymentCard = new Schema({
  number: { type: String, required: true, unique: true },
  expirationDate: { type: String, required: true },
  name: { type: String },
  surname: { type: String },
  CVC: { type: String, required: true },
  currency: { type: String, required: true },

  user: { type: ObjectId, ref: 'User' },
})

module.exports = model('PaymentCard', PaymentCard)
