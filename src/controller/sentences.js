module.exports = (conn) => {
  const api = require('express').Router()
  const { checkLoggedIn, checkIsAdmin } = require('../middleware/authenticate')
  const messages = require('../messages')
  const errorHandler = require('../queryErrorHandler')

  api.post('/', checkLoggedIn, (req, res) => {
    const text = req.body.text
    const userId = req.user.id
    const roomId = req.body.roomId

    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = 'INSERT INTO sentences SET ?'
        const fields = { text, userId, roomId }
        await conn.query(sql, fields)

        return res.status(201).json(messages.SUCCESS())
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errorHandler(res))
  })

  api.delete('/', checkIsAdmin, (req, res) => {
    const userId = req.body.userId
    const roomId = req.body.roomId

    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = 'DELETE FROM sentences WHERE userId = ? AND roomId = ?'
        const fields = { userId, roomId }
        const [{ affectedRows }] = await conn.query(sql, fields)

        return res.json(messages.SUCCESS('', affectedRows))
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errorHandler(res))
  })

  api.patch('/', checkIsAdmin, (req, res) => {
    const userId = req.body.userId
    const roomId = req.body.roomId
    const text = req.body.text

    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = 'UPDATE sentences SET text = ? WHERE userId = ? AND roomId = ?'
        const fields = { text, userId, roomId }
        const [{ affectedRows }] = await conn.query(sql, fields)

        return res.json(messages.SUCCESS('', affectedRows))
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errorHandler(res))
  })

  return api
}
