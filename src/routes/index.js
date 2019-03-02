module.exports = (router) => {
  const users = require('../controller/users')
  const auth = require('../controller/auth')
  const conn = require('../config/db').pool

  router.use('/users', users(conn))
  router.use('/auth', auth(conn))

  return router
}
