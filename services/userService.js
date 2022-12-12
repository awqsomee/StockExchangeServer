import User from '../models/User.js'
import { v4 } from 'uuid'
import path from 'path'
import fs from 'fs'

class UserService {
  async getUserInfo(currentUser) {
    let user = await User.findOne({ _id: currentUser.id })
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      avatar: user.avatar,
      birthday: user.birthday,
      phoneNumber: user.phoneNumber,
      passportNumber: user.passportNumber,
    }
  }

  async changeUserInfo(currentUser, newUserInfo) {
    if (newUserInfo.email == null) throw { message: 'Email не может быть пустым' }
    if (newUserInfo.name == null) throw { message: 'Имя не может быть пустым' }
    if (newUserInfo.username == null) throw { message: 'Username не может быть пустым' }
    let user = await User.findOne({ _id: currentUser.id })
    if (user.email != newUserInfo.email) {
      var candidate = await User.findOne({ email: newUserInfo.email })
      if (candidate?.email) throw { message: `Email ${candidate.email} уже используется` }
    }
    if (user.lowercaseUsername != newUserInfo.username.toLowerCase()) {
      var candidate = await User.findOne({ lowercaseUsername: newUserInfo.username.toLowerCase() })
      if (candidate?.lowercaseUsername) throw { message: `Username ${candidate.username} уже используется` }
    }
    const validKeys = ['email', 'username', 'name', 'birthday', 'phoneNumber', 'passportNumber']
    Object.keys(newUserInfo).forEach((key) => validKeys.includes(key) || delete newUserInfo[key])
    user = await User.findOneAndUpdate(
      { _id: currentUser.id },
      { ...newUserInfo, lowercaseUsername: user.username.toLowerCase() },
      {
        returnOriginal: false,
      }
    )
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      avatar: user.avatar,
      birthday: user.birthday,
      phoneNumber: user.phoneNumber,
      passportNumber: user.passportNumber,
    }
  }

  async deleteUser(currentUser) {
    let user = await User.findOne({ _id: currentUser.id })
    if (user.balance != 0) throw { message: 'На вашем аккаунте остались платежные средства' }
    await User.deleteOne({ _id: currentUser.id })
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
    }
  }

  async uploadAvatar(currentUser, file, avatarPath) {
    let user = await User.findOne({ _id: currentUser.id })
    const avatarName = v4() + '.jpg'
    if (user.avatar) {
      if (fs.existsSync(path.join(avatarPath, user.avatar))) fs.unlinkSync(path.join(avatarPath, user.avatar))
    }
    file.mv(path.join(avatarPath, avatarName))
    user.avatar = avatarName
    await user.save()
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      avatar: user.avatar,
    }
  }

  async deleteAvatar(currentUser, avatarPath) {
    let user = await User.findOne({ _id: currentUser.id })
    if (!user.avatar) throw { message: 'У вас нет аватара' }
    fs.unlinkSync(path.join(avatarPath, user.avatar))
    user.avatar = null
    await user.save()
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      avatar: user.avatar,
    }
  }
}

export default new UserService()
