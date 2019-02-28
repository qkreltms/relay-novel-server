module.exports = () => {
  const router = require('express').Router()
  const users = require('../controller/users')

  router.use('/users', users)

  return router
}
