module.exports = (conn) => {
  const messages = require('../messages')
  const { checkLoggedIn } = require('../middleware/authenticate')
  const api = require('express').Router()
  const errHandler = require('../queryErrorHandler')
  // 방문한 유저 찾기
  api.get('/join', (req, res) => {
    const userId = req.body.userId
    const roomId = req.body.roomId
    const skip = req.body.skip || 0
    const limit = req.body.limit || 30

    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = `SELECT * FROM roomVisitors WHERE visitorId = ? AND roomId = ? LIMIT ${skip}, ${limit}`
        const filters = [ userId, roomId ]
        const [result] = await conn.query(sql, filters)

        return res.json(messages.SUCCESS(result))
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })
  // 모든 방 출력
  api.get('/', (req, res) => {
    const skip = req.body.skip || 0
    const limit = req.body.limit || 30

    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = `SELECT * FROM rooms LIMIT ${skip}, ${limit}`
        const [result] = await conn.query(sql)

        return res.json(messages.SUCCESS(result))
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  // 유저가 방장인 방 찾음
  api.get('/', (req, res) => {
    const userId = req.body.userId
    const skip = req.body.skip || 0
    const limit = req.body.limit || 30

    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = `SELECT * FROM rooms WHERE creatorId = ? LIMIT ${skip}, ${limit}`
        const filters = [ userId ]
        const [result] = await conn.query(sql, filters)

        return res.json(messages.SUCCESS(result))
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  // 방에 누가 참가했는지
  api.get('/join', (req, res) => {
    const userId = req.body.userId
    const roomId = req.body.roomId
    const skip = req.body.skip || 0
    const limit = req.body.limit || 30

    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = `SELECT * FROM roomJoinedUsers WHERE userId = ? AND roomId = ? LIMIT ${skip}, ${limit}`
        const filters = [ userId, roomId ]
        const [result] = await conn.query(sql, filters)

        return res.json(messages.SUCCESS(result))
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

        return joinRoom(req, res, createdRoomId)
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  // @desc : 방 글쓰기 참가
  // @url : http://localhost:3001/api/rooms/join
  // @method : POST
  // @body : roomId: String
  api.post('/join', checkLoggedIn, (req, res) => {
    return joinRoom(req, res)
  })

  // @desc : 방 글쓰기 나가기
  // @url : http://localhost:3001/api/rooms/join
  // @method : DELETE
  // @body : roomId: String
  api.delete('/join', checkLoggedIn, (req, res) => {
    const roomId = req.body.roomId
    const userId = req.user.id

    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = 'DELETE FROM roomJoinedUsers WHERE userId = ? AND roomId = ?'
        const filters = [ userId, roomId ]
        const [{ affectedRows }] = await conn.query(sql, filters)

        return res.json(messages.SUCCESS('', affectedRows))
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  // @desc : 방 보기 참가
  // @url : http://localhost:3001/api/rooms/visit
  // @method : POST
  // @body : roomId: String
  api.post('/visit', checkLoggedIn, (req, res) => {
    const roomId = req.body.roomId
    const userId = req.user.id

    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = 'INSERT INTO roomVisitors SET ?'
        const fields = { 'visitorId': userId, roomId }
        await conn.query(sql, fields)

        return res.json(messages.SUCCESS())
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  // @desc : 방 보기 나가기
  // @url : http://localhost:3001/api/rooms/visit
  // @method : DELETE
  // @body : roomId: String
  api.delete('/visit', checkLoggedIn, (req, res) => {
    const roomId = req.body.roomId
    const userId = req.user.id

    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = 'DELETE FROM roomVisitors WHERE visitorId = ? AND roomId = ?'
        const filters = [ userId, roomId ]
        const [{ affectedRows }] = await conn.query(sql, filters)

        return res.status(201).json(messages.SUCCESS('', affectedRows))
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  const joinRoom = (req, res, roomId = req.body.roomId) => {
    const userId = req.user.id

    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = 'INSERT INTO roomJoinedUsers SET ?'
        const fields = { userId, roomId }
        await conn.query(sql, fields)

        return res.status(201).json(messages.SUCCESS())
      } catch (err) {
        return errHandlerCallback(err)
      }
    }
    return runQuery(errHandler(res))
  }

  return api
}
