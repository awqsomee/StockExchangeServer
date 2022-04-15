const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next()
  }
  try {
    console.log('auth')
    console.log(req.headers.authorization.split(' ')[1])
    const token = req.headers.authorization.split(' ')[1]
    if (!token) {
      return res.status(401).json({ message: 'Auth error' })
    }
    const decoded = jwt.verify(token, config.get('key'))
    req.user = decoded
    next()
  } catch (e) {
    return res.status(401).json({ message: 'Auth error' })
  }
}
