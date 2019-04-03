module.exports = (router) => {
  const users = require('../controller/users')
  const auth = require('../controller/auth')
  const rooms = require('../controller/rooms')
  const sentences = require('../controller/sentences')
  const initializeDB = require('../config/db')

  initializeDB((pool) => {
    router.use('/users', users(pool))
    router.use('/auth', auth(pool))
    router.use('/rooms', rooms(pool))
    router.use('/sentences', sentences(pool))
  })

  return router
}
