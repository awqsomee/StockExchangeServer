function filePath(path) {
  return function (req, res, next) {
    req.filePath = path
    next()
  }
}

export default filePath
