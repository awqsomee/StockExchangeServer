import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import config from 'config'
import { validationResult } from 'express-validator'
import User from '../models/User.js'

const generateAccessToken = (id) => {
  const payload = {
    id,
  }
  return jwt.sign(payload, config.get('key'), { expiresIn: '24h' })
}

class authController {
  async registration(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Incorrect request', errors })
      }

      const { email, password, name, surname } = req.body
      const lowerCaseEmail = email.toLowerCase()
      const candidate = await User.findOne({ email: lowerCaseEmail })
      if (candidate) {
        return res.status(400).json({
          message: `User with email ${email} already exists`,
        })
      }
      const hashPassword = await bcrypt.hash(password, 8)
      const user = await User.create({ email: lowerCaseEmail, password: hashPassword, name, surname })
      const token = generateAccessToken(user.id)
      return res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          balance: user.balance,
          avatar: user.avatar,
        },
        message: 'User was created',
      })
    } catch (e) {
      return res.status(500).json(e)
    }
  }

  async login(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Incorrect request', errors })
      }

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
      const token = generateAccessToken(user.id)
      return res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          balance: user.balance,
          avatar: user.avatar,
        },
        message: 'Login confirmed',
      })
    } catch (e) {
      return res.status(500).json(e)
    }
  }
  async auth(req, res) {
    try {
      const user = await User.findOne({ _id: req.user.id })
      const token = generateAccessToken(user.id)
      return res.json({
        token,
        user: {
          id: user.id,
          name: user.name,
          balance: user.balance,
          avatar: user.avatar,
        },
        message: 'Authentification completed',
      })
    } catch (e) {
      console.log(e)
      return res.status(500).json(e)
    }
  }
}

export default new authController()
