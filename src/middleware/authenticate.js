const messages = require('../messages')

// 로그인이 되어있는지 확인, 로그인 안되어있을시 실패 메세지 반환
const checkLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  return res.status(401).json(messages.ACCESS_DENIED)
}

// 로그인이 안되있는지 확인, 로그인 되어있을시 실패 메세지 반환
const checkLoggedOut = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next()
  }
  return res.status(404).json(messages.SESSION_NOT_FOUND)
}

// 어드민 확인
const checkIsAdmin = (req, res, next) => {
  if (req.user.isAdmin) return next()
  return res.status(409).json(messages.NOT_ADMIN)
}

module.exports = {
  checkLoggedIn,
  checkLoggedOut,
  checkIsAdmin
}
