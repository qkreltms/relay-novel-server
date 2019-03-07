module.exports = (conn) => {
  const messages = require('../messages')
  const { checkLoggedIn } = require('../middleware/authenticate')
  const api = require('express').Router()
  const errHandler = require('../queryErrorHandler')
  // 모든 room table 값 가져옴
  api.get('/', (req, res) => {
    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = 'SELECT * FROM rooms'
        const result = await conn.query(sql)

        return result
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

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
        const createdRoomId = result.insertId

        joinRoom(creatorId, createdRoomId)

        return res.status(201).json(messages.SUCCESS_MSG)
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  api.post('/join', checkLoggedIn, (req, res) => {
    const roomId = req.body.roomId

    const runQuery = (errHandlerCallback) => {
      try {
        joinRoom(req.user.id, roomId)

        return res.status(201).json(messages.SUCCESS_MSG)
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  api.delete('/join', checkLoggedIn, (req, res) => {
    const roomId = req.body.roomId
    const userId = req.user.id

    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = 'DELETE FROM rooms WHERE userId = ?, roomId = ?'
        const fields = { userId, roomId }
        await conn.query(sql, fields)

        return res.json(messages.SUCCESS_MSG)
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  api.post('/visit', checkLoggedIn, (req, res) => {
    const roomId = req.body.roomId

    const runQuery = (errHandlerCallback) => {
      try {
        visitRoom(req.user.id, roomId)

        return res.status(201).json(messages.SUCCESS_MSG)
      } catch (err) {
        errHandlerCallback(err)
      }
    }

    runQuery(errHandler(res))
  })

  const joinRoom = async (userId, roomId) => {
    const sql = 'INSERT INTO roomJoinedUsers SET ?'
    const fields = { userId, roomId }
    const result = await conn.query(sql, fields)

    return result
  }

  const visitRoom = async (userId, roomId) => {
    const sql = 'INSERT INTO roomVisitors SET ?'
    const fields = { 'visitorId': userId, roomId }
    const result = await conn.query(sql, fields)

    return result
  }

  return api
}
