module.exports = (conn) => {
  const messages = require('../messages')
  const { checkLoggedIn } = require('../middleware/authenticate')
  const api = require('express').Router()
  const errHandler = require('../queryErrorHandler')

  // @desc : 모든 방 출력
  // @url : http://localhost:3001/api/rooms/all
  // @method : GET
  // @query : skip: String, limit: String
  api.get('/all', (req, res) => {
    const skip = req.query.skip || 0
    const limit = req.query.limit || 30

    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = `SELECT id, writerLimit, tags, title, 'desc', creatorId, updatedAt, createdAt FROM rooms ORDER BY createdAt DESC LIMIT ${skip}, ${limit}`
        const [result] = await conn.query(sql)

        return res.json(messages.SUCCESS(result))
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  // @desc : 방 생성
  // @url : http://localhost:3001/api/rooms
  // @method : POST
  // @query : writerLimit?: String, tags?: String, title: String, desc: String
  api.post('/', checkLoggedIn, (req, res) => {
    const writerLimit = req.body.writerLimit
    const tags = req.body.tags
    const title = req.body.title
    const desc = req.body.desc
    const creatorId = req.user.id
    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = 'INSERT INTO rooms SET ?'
        const fields = { writerLimit, tags, title, desc, creatorId }
        const [result] = await conn.query(sql, fields)
        // const createdRoomId = result.insertId

        return res.json(messages.SUCCESS(result))
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  return api
}
