module.exports = (router) => {
  const users = require('../controller/users')
  const auth = require('../controller/auth')
  const rooms = require('../controller/rooms')
  const initializeDB = require('../config/db')

  initializeDB((conn) => {
    router.use('/users', users(conn))
    router.use('/auth', auth(conn))
    router.use('/rooms', rooms(conn))
  })

  return router
}
