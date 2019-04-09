module.exports = (pool) => {
  const messages = require('../messages')
  const { checkLoggedIn } = require('../middleware/authenticate')
  const api = require('express').Router()
  const errHandler = require('../queryErrorHandler')

  // @desc : 모든 방 출력
  // @url : http://localhost:3001/api/rooms
  // @method : GET
  // @query : skip: String, limit: String
  api.get('/', (req, res) => {
    const skip = req.query.skip || 0
    const limit = req.query.limit || 30
    const roomId = req.query.roomId
    console.log(roomId)

    const runQuery = async (errHandlerCallback) => {
      try {
        if (roomId) {
          const sql = `SELECT id, writerLimit, tags, title, \`desc\`, \`like\`, \`dislike\`, creatorId, updatedAt, createdAt, isDeleted FROM rooms WHERE id = ?`
          const field = [roomId]
          const [result] = await pool.query(sql, field)
          return res.json(messages.SUCCESS(result))
        } else {
          const sql = `SELECT id, writerLimit, tags, title, \`desc\`, \`like\`, \`dislike\`, creatorId, updatedAt, createdAt, isDeleted FROM rooms ORDER BY createdAt DESC LIMIT ${skip}, ${limit}`
          const [result] = await pool.query(sql)
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
  api.get('/join', (req, res) => {
    const runQuery = async (errHandlerCallback) => {
      try {
        // TODO: 이 상태로 join 쿼리 작성시 SQL인젝션 가능?
        const sql = `SELECT nickname, thumbnail, isDeleted FROM roomjoinedusers JOIN users WHERE roomjoinedusers.userid = users.id`
        const [result] = await pool.query(sql)

        return res.json(messages.SUCCESS(result))
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  // @desc : 방 생성 및 방 참가
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

        const sql = 'INSERT INTO rooms SET ?'
        const fields = { writerLimit, tags, title, desc, creatorId }
        const [result] = await conn.query(sql, fields)
        const createdRoomId = result.insertId

        const sql2 = 'INSERT INTO roomjoinedusers SET ?'
        const fields2 = { userId: creatorId, roomId: createdRoomId }
        await conn.query(sql2, fields2)

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

  // @desc : 방 참가
  // @url : http://localhost:3001/api/rooms/join
  // @method : POST
  // @body: roomId: string
  api.post('/join', checkLoggedIn, (req, res) => {
    const roomId = req.body.roomId
    const userId = req.user.id
    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = 'INSERT INTO roomjoinedusers SET ?'
        const fields = { userId, roomId }
        const result = await pool.query(sql, fields)

        return res.json(messages.SUCCESS(result))
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  // TODO: 방 참가 나가기
  // TODO: 방 삭제

  // @desc : 방 수정
  // @url : http://localhost:3001/api/rooms
  // @method : PUT
  // @body: roomId: string, writerLimit: string, tags: string, title: string, desc: string
  api.put('/', checkLoggedIn, (req, res) => {
    const roomId = req.body.roomId
    const writerLimit = req.body.writerLimit
    const tags = req.body.tags
    const title = req.body.title
    const desc = req.body.desc
    const userId = req.user.id
    const isDeleted = req.body.isDeleted
    // TODO: isdeleted string to boolean 형 확인
    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = `UPDATE rooms SET writerLimit = ?, tags = ?, title = ?, \`desc\` = ?, isDeleted = ? WHERE roomid = ? AND userid = ?`
        const fields = { writerLimit, tags, title, desc, roomId, userId, isDeleted }
        const [result] = await pool.query(sql, fields)

        return res.json(messages.SUCCESS(result))
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  return api
}
