module.exports = (router) => {
  const users = require('../controller/users')
  const auth = require('../controller/auth')
  const initializeDB = require('../config/db')

  initializeDB((conn) => {
    router.use('/users', users(conn))
    router.use('/auth', auth(conn))
  })

  return router
}
