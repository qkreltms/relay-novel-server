module.exports = (pool) => {
  const messages = require('../messages')
  const {
    checkLoggedIn
  } = require('../middleware/authenticate')
  const api = require('express').Router()
  const errHandler = require('../queryErrorHandler')

  // @desc : 모든 방 출력
  // @url : http://localhost:3001/api/rooms
  // @method : GET
  // @query : skip: String, limit: String, roomId?: string
  api.get('/', (req, res) => {
    const skip = req.query.skip || 0
    const limit = req.query.limit || 30
    const roomId = req.query.roomId

    const runQuery = async (errHandlerCallback) => {
      try {
        if (roomId) {
          const sql = `SELECT id, writerLimit, tags, title, \`desc\`, \`like\`, creatorId, updatedAt, createdAt FROM rooms WHERE id = ? AND isDeleted = ?`
          const fields = [roomId, false]
          const [result] = await pool.query(sql, fields)
          return res.json(messages.SUCCESS(result))
        } else {
          const sql = `SELECT id, writerLimit, tags, title, \`desc\`, \`like\`, creatorId, updatedAt, createdAt FROM rooms WHERE isDeleted = ? ORDER BY createdAt DESC LIMIT ${skip}, ${limit}`
          const fields = [false]
          const [result] = await pool.query(sql, fields)
          return res.json(messages.SUCCESS(result))
        }
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  // @desc : 방에 참가한 모든 사람 출력
  // @url : http://localhost:3001/api/rooms/join
  // @method : GET
  // @query : roomId: string
  api.get('/join', (req, res) => {
    const roomId = req.query.roomId

    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = `SELECT id, nickname, thumbnail, writeable FROM users JOIN (SELECT userId, writeable FROM roomJoinedUsers WHERE roomId = ?) AS a WHERE users.id = a.userId AND isDeleted = ?`
        const fields = [roomId, false]
        const [result] = await pool.query(sql, fields)

        return res.json(messages.SUCCESS(result))
      } catch (err) {
        // TODO: duplicate 떠도 섭단에서 에러 안뜨도록
        return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  // @desc : 방에 참가했는지 확인
  // @url : http://localhost:3001/api/rooms/writeable
  // @method : GET
  // @query : roomId: string
  api.get('/writeable', checkLoggedIn, (req, res) => {
    const roomId = req.query.roomId
    const userId = req.user.id

    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = `SELECT writeable FROM roomJoinedUsers WHERE roomId = ? AND userId = ?`
        const fields = [roomId, userId]
        const [result] = await pool.query(sql, fields)

        let writeable = false
        if (result[0]) {
          writeable = result[0].writeable
        }

        return res.json(messages.SUCCESS(writeable))
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  // @desc : 모든 room의 개수 출력
  // @url : http://localhost:3001/api/rooms/total
  // @method : GET
  api.get('/total', (req, res) => {
    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = `SELECT total FROM roomsInfo WHERE id = ?`
        const fields = [0]
        const [result] = await pool.query(sql, fields)

        return res.json(messages.SUCCESS(result))
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  // @desc : 방 참가 가능한 슬롯 출력
  // @url : http://localhost:3001/api/rooms/slot
  // @method : GET
  // @query : roomId: string
  api.get('/slot', (req, res) => {
    const roomId = req.query.roomId

    const runQuery = async (errHandlerCallback) => {
      const conn = await pool.getConnection()

      try {
        await conn.query('START TRANSACTION')
        const sql = `SELECT total FROM roomJoinedUsersInfo WHERE roomId = ?`
        const fields = [roomId]
        const [[{ total }]] = await conn.query(sql, fields)

        const result = {
          slot: total || 0
        }

        await conn.query('COMMIT')
        await conn.release()

        return res.json(messages.SUCCESS(result))
      } catch (err) {
        await conn.query('ROLLBACK')
        await conn.release()

        return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  // @desc : 방 인원 제한 출력
  // @url : http://localhost:3001/api/rooms/limit
  // @method : GET
  // @query : roomId: string
  api.get('/limit', (req, res) => {
    const roomId = req.query.roomId

    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = `SELECT writerLimit FROM rooms WHERE id = ?`
        const field = [roomId]
        const [[{ writerLimit }]] = await pool.query(sql, field)

        return res.json(messages.SUCCESS(writerLimit))
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  // @desc : 방에서 좋아요를 눌렀는지 안눌렀는지 확인
  // @url : http://localhost:3001/api/rooms/isLike
  // @method : GET
  // @query : userId: string, roomId: string
  api.get('/isLike', (req, res) => {
    const roomId = req.query.roomId
    const userId = req.query.userId

    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = `SELECT isLike FROM roomLikes WHERE roomId = ? AND userId = ?`
        const field = [roomId, userId]
        const [[result]] = await pool.query(sql, field)

        if (!result) return res.json(messages.SUCCESS({ isLike: false }))
        return res.json(messages.SUCCESS({ isLike: result.isLike || false }))
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  // @desc : 방 좋아요 추가
  // @url : http://localhost:3001/api/rooms/like
  // @method : POST
  // @body : userId: string, roomId: string, isLike: string
  api.post('/like', (req, res) => {
    const roomId = req.body.roomId
    const userId = req.body.userId
    const isLike = req.body.isLike

    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = `INSERT INTO roomLikes(roomId, userId, isLike) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE isLike = ?`
        const field = [roomId, userId, isLike, isLike]
        const [result] = await pool.query(sql, field)

        if (result.affectedRows > 1) return res.json(messages.SUCCESS(result))
        return res.status(201).json(messages.SUCCESS(result))
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  // @desc : 방 생성
  // @url : http://localhost:3001/api/rooms
  // @method : POST
  // @body : writerLimit?: String, tags?: String, title: String, desc: String
  api.post('/', checkLoggedIn, (req, res) => {
    const writerLimit = req.body.writerLimit
    const tags = req.body.tags
    const title = req.body.title
    const desc = req.body.desc
    const creatorId = req.user.id
    const runQuery = async (errHandlerCallback) => {
      const conn = await pool.getConnection()

      try {
        await conn.query('START TRANSACTION')
        // TODO: procedure에서 하기
        const sql = 'INSERT INTO rooms SET ?'
        const fields = {
          writerLimit,
          tags,
          title,
          desc,
          creatorId
        }
        const [{ insertId }] = await conn.query(sql, fields)
        const createdRoomId = insertId

        const sql4 = `INSERT INTO roomJoinedUsersInfo SET ?`
        const fields4 = {
          roomId: createdRoomId
        }
        const [result] = await conn.query(sql4, fields4)

        const sql2 = 'INSERT INTO roomJoinedUsers(userId, roomId, writeable) VALUES (?, ?, ?) '
        const fields2 = [
          creatorId,
          createdRoomId,
          true
        ]
        await conn.query(sql2, fields2)

        const sql3 = `INSERT INTO sentencesInfo SET ?`
        const fields3 = {
          roomId: createdRoomId
        }
        await conn.query(sql3, fields3)

        await conn.query('COMMIT')
        await conn.release()

        result.insertId = insertId
        return res.status(201).json(messages.SUCCESS(result))
      } catch (err) {
        await conn.query('ROLLBACK')
        await conn.release()

        return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  // @desc : 방 글쓰기 참가
  // @url : http://localhost:3001/api/rooms/join
  // @method : POST
  // @body: roomId: string
  api.post('/join', checkLoggedIn, (req, res) => {
    const roomId = req.body.roomId
    const userId = req.user.id

    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = 'INSERT INTO roomJoinedUsers(userId, roomId, writeable) VALUES (?, ?, ?)'
        const fields = [userId, roomId, true]
        const result = await pool.query(sql, fields)

        return res.status(201).json(messages.SUCCESS(result))
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  // TODO: 방 참가 나가기
  // TODO: 방 삭제
  // TODO: 방 수정

  return api
}
