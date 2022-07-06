const Router = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const { check, validationResult } = require('express-validator')
const User = require('../models/User')
const authMiddleware = require('../middleware/auth.middleware')
const router = new Router()

router.post(
  '/registration',
  [
    check('email', 'Uncorrect email').isEmail(),
    check('password', 'Password must be longer than 3 and shorter than 16').isLength({ min: 3, max: 16 }),
    check('name', 'Name must be longer than 3').isLength({ min: 3 }),
    check('surname', 'Surname must be longer than 3').isLength({ min: 3 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Uncorrect request', errors })
      }

      const { email, password, name, surname } = req.body
      const lowerCaseEmail = email.toLowerCase()
      console.log(lowerCaseEmail)
      const candidate = await User.findOne({ email: lowerCaseEmail })
      console.log(candidate)

      if (candidate) {
        return res.status(400).json({
          message: `User with email ${email} already exists`,
        })
      }
      const hashPassword = await bcrypt.hash(password, 8)
      const user = new User({ email: lowerCaseEmail, password: hashPassword, name, surname })
      console.log(user)
      await user.save()
      const token = jwt.sign({ id: user.id }, config.get('key'), {
        expiresIn: '24h',
      })
      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          balanceRUB: user.balanceRUB,
          balanceUSD: user.balanceUSD,
          stocks: user.stocks,
          avatar: user.avatar,
        },
        message: 'User was created',
      })
    } catch (e) {
      console.log(e)
      res.send({ message: 'Server error' })
    }
  }
)

router.post(
  '/login',

  async (req, res) => {
    try {
      const { email, password } = req.body
      const lowerCaseEmail = email.toLowerCase()
      const user = await User.findOne({ email: lowerCaseEmail })
      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }
      const isPassValid = bcrypt.compareSync(password, user.password)
      if (!isPassValid) {
        return res.status(400).json({ message: 'Invalid password' })
      }
      const token = jwt.sign({ id: user.id }, config.get('key'), {
        expiresIn: '24h',
      })
      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          balanceRUB: user.balanceRUB,
          balanceUSD: user.balanceUSD,
          stocks: user.stocks,
          avatar: user.avatar,
        },
        message: 'Login confirmed',
      })
    } catch (e) {
      console.log(e)
      res.send({ message: 'Server error' })
    }
  }
)

router.get('/auth', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id })
    const token = jwt.sign({ id: user.id }, config.get('key'), {
      expiresIn: '24h',
    })
    console.log(user)
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        surname: user.surname,
        balanceRUB: user.balanceRUB,
        balanceUSD: user.balanceUSD,
        stocks: user.stocks,
      },
    })
  } catch (e) {
    console.log(e)
    res.send({ message: 'Server error' })
  }
})

module.exports = router
