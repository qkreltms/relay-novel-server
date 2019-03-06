module.exports = (conn) => {
  const messages = require('../messages')
  const { checkLoggedIn } = require('../middleware/authenticate')
  const api = require('express').Router()
  const errHandler = require('../errorHandler')

  api.get('/', (req, res) => {

  })

  api.post('/', checkLoggedIn, (req, res) => {
    const writerLimit = req.body.writerLimit
    const tags = req.body.tags
    const title = req.body.title
    const desc = req.body.desc
    console.log(req.user)
    const creatorId = req.user.id

    const runQuery = async (errHandlerCallback) => {
      const sql = 'INSERT INTO rooms SET ?'
      const fields = { writerLimit, tags, title, desc, creatorId }

      try {
        await conn.query(sql, fields)
        return res.status(201).json(messages.SUCCESS_MSG)
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler)
  })

  return api
}
