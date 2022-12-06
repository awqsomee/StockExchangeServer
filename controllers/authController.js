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
        return res.status(400).json({ message: 'Некорректный запрос', errors })
      }

      const { email, password, name } = req.body
      const lowerCaseEmail = email.toLowerCase()
      const candidate = await User.findOne({ email: lowerCaseEmail })
      if (candidate) {
        return res.status(400).json({
          message: `Пользователь с почтой ${email} уже существует`,
        })
      }
      const hashPassword = await bcrypt.hash(password, 8)
      const user = await User.create({ email: lowerCaseEmail, username: lowerCaseEmail, password: hashPassword, name })
      const token = generateAccessToken(user.id)
      return res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          balance: user.balance,
          avatar: user.avatar,
        },
        message: 'Пользователь был успешно создан',
      })
    } catch (e) {
      return res.status(500).json(e)
    }
  }

  async login(req, res) {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Некорректный запрос', errors })
      }

      const { email, password } = req.body
      const lowerCaseUsername = email.toLowerCase()
      let user = await User.findOne({ email: lowerCaseUsername })
      if (!user) {
        user = await User.findOne({ username: lowerCaseUsername })
        if (!user) return res.status(404).json({ message: 'Пользователь не найден' })
      }
      const isPassValid = bcrypt.compareSync(password, user.password)
      if (!isPassValid) {
        return res.status(400).json({ message: 'Неверный пароль' })
      }
      const token = generateAccessToken(user.id)
      return res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email,
          balance: user.balance,
          avatar: user.avatar,
        },
        message: 'Вход выполнен успешно',
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
          username: user.username,
          name: user.name,
          email: user.email,
          balance: user.balance,
          avatar: user.avatar,
        },
        message: 'Аутентификация пройдена',
      })
    } catch (e) {
      console.log(e)
      return res.status(500).json(e)
    }
  }
}

export default new authController()
