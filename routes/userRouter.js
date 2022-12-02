import { Router } from 'express'
import authMiddleware from '../middleware/authMiddleware.js'
import userController from '../controllers/userController.js'

const router = new Router()

router.get('', authMiddleware, userController.getUser)
router.put('', authMiddleware, userController.changeUser)
router.delete('/', authMiddleware, userController.deleteUser)
router.post('/avatar', authMiddleware, userController.uploadAvatar)
router.delete('/avatar/', authMiddleware, userController.deleteAvatar)

export default router
