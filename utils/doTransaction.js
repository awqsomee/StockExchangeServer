export default (balance, amount) => {
  if (balance >= -amount || amount > 0) {
    balance += amount
  } else throw { message: 'Not enough money' }
  return balance
}
