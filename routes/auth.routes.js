const Router = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('config')
const { check } = require('express-validator')
const User = require('../models/User')
const authMiddleware = require('../middleware/auth.middleware')
const authController = require('../controllers/authController')
const router = new Router()

router.post(
  '/registration',
  [
    check('email', 'Uncorrect email').isEmail(),
    check('password', 'Password must be longer than 3 and shorter than 16').isLength({ min: 3, max: 16 }),
    check('name', 'Name cannot be empty').notEmpty(),
    check('email', 'Email must be string').isString(),
    check('password', 'Password must be string').isString(),
    check('name', 'Name must be string').isString(),
  ],
  authController.registration
)

router.post(
  '/login',
  [
    check('email', 'Email cannot be empty').notEmpty(),
    check('password', 'Password cannot be empty').notEmpty(),
    check('email', 'Email must be string').isString(),
    check('password', 'Password must be string').isString(),
  ],
  authController.login
)

router.get('', authMiddleware, authController.auth)

module.exports = router
