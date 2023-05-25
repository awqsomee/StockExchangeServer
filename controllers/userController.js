import userService from '../services/userService.js'

class userController {
  async getUser(req, res) {
    try {
      const currentUser = req.user
      const user = await userService.getUserInfo(currentUser)
      return res.json({ user, message: 'Данные пользователя успешно получены' })
    } catch (e) {
      return res.status(400).json(e)
    }
  }

  async changeUser(req, res) {
    try {
      const newUserInfo = req.body
      const currentUser = req.user
      const user = await userService.changeUserInfo(currentUser, newUserInfo)
      return res.json({ user, message: 'Данные пользователя успешно изменены' })
    } catch (e) {
      return res.status(400).json(e)
    }
  }

  async deleteUser(req, res) {
    try {
      const currentUser = req.user
      const user = await userService.deleteUser(currentUser)
      return res.json({ user, message: 'Пользователь удален' })
    } catch (e) {
      return res.status(400).json(e)
    }
  }

  async uploadAvatar(req, res) {
    try {
      const file = req.files.file
      const currentUser = req.user
      const path = req.filePath
      const user = await userService.uploadAvatar(currentUser, file, path)
      return res.json({ user, message: 'Аватар обновлен' })
    } catch (e) {
      return res.status(400).json(e)
    }
  }

  async deleteAvatar(req, res) {
    try {
      const currentUser = req.user
      const path = req.filePath
      const user = await userService.deleteAvatar(currentUser, path)
      return res.json({ user, message: 'Аватар успешно удален' })
    } catch (e) {
      return res.status(400).json(e)
    }
  }
}

export default new userController()
