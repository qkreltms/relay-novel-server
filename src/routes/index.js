module.exports = (router) => {
  const users = require('../controller/users')
  const db = require('../config/db').pool

  router.use('/users', users(db))

  return router
}
