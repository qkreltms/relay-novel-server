module.exports = (pool) => {
  const messages = require('../messages')
  const api = require('express').Router()
  const errHandler = require('../queryErrorHandler')

  // @desc : 방에 참가한 유저, 쓰기가능 여부, 방 좋아요 눌렀는지 출력
  // @url : http://localhost:3001/api/rooms/info
  // @method : GET
  // @query : roomId: string, userId: string
  api.get('/info', (req, res) => {
    const roomId = req.query.roomId
    const userId = req.query.userId
    const isLoggedIn = req.query.isLoggedIn === 'false' ? 0 : 1

    const runQuery = async (errHandlerCallback) => {
      const conn = await pool.getConnection()
      const result = {
        joinedUserTotal: 0,
        isWriteable: false,
        isLike: false,
        novelTotal: 0,
        writerLimit: 0,
        tags: '',
        title: '',
        genre: '',
        desc: '',
        coverImage: '',
        user: {}, // {nickname: string, thumbnail: string}
        like: 0,
        createdAt: new Date()
      }

      try {
        await conn.query('START TRANSACTION')

        const sql5 = `SELECT tags, restSpace, genre, createdAt, \`like\`, writerLimit, tags, title, genre, \`desc\`, coverImage, creatorId FROM rooms WHERE id = ?`
        const field5 = [roomId]
        const [[roomInfo]] = await conn.query(sql5, field5)
        const creatorId = roomInfo.creatorId
        result.coverImage = roomInfo.coverImage
        result.desc = roomInfo.desc
        result.genre = roomInfo.genre
        result.title = roomInfo.title
        result.tags = roomInfo.tags
        result.writerLimit = roomInfo.writerLimit
        result.createdAt = roomInfo.createdAt
        result.like = roomInfo.like
        result.genre = roomInfo.genre
        result.tags = roomInfo.tags
        result.joinedUserTotal = roomInfo.restSpace

        const sql7 = `SELECT nickname, thumbnail FROM users WHERE id = ?`
        const field7 = [creatorId]
        result.user = await conn.query(sql7, field7)
        result.user = result.user[0][0]

        const sql6 = `SELECT total FROM sentencesInfo WHERE roomId = ?`
        const fields6 = [roomId]
        result.novelTotal = await conn.query(sql6, fields6)
        result.novelTotal = result.novelTotal[0][0].total

        if (isLoggedIn) {
          const sql3 = `SELECT writeable FROM roomJoinedUsers WHERE roomId = ? AND userId = ?`
          const fields3 = [roomId, userId]
          result.isWriteable = await conn.query(sql3, fields3)
          if (result.isWriteable[0][0]) {
            result.isWriteable = result.isWriteable[0][0].writeable
          } else {
            result.isWriteable = false
          }

          const sql4 = `SELECT isLike FROM roomLikes WHERE roomId = ? AND userId = ?`
          const field4 = [roomId, userId]
          result.isLike = await conn.query(sql4, field4)
          if (result.isLike[0][0]) {
            result.isLike = result.isLike[0][0].isLike
          } else {
            result.isLike = false
          }
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

  // @desc : 모든 방 출력
  // @url : http://localhost:3001/api/rooms
  // @method : GET
  // @query : skip: String, limit: String
  api.get('/', (req, res) => {
    const skip = req.query.skip || 0
    const limit = req.query.limit || 30

    const runQuery = async (errHandlerCallback) => {
      const conn = await pool.getConnection()
      try {
        await conn.query('START TRANSACTION')

        const sql = `SELECT A.id, writerLimit, tags, title, \`desc\`,\`like\`, creatorId, updatedAt, createdAt, nickname, thumbnail FROM (SELECT id, writerLimit, tags, title, \`desc\`, \`like\`, creatorId, updatedAt, createdAt FROM rooms WHERE isDeleted = false LIMIT ${skip}, ${limit}) AS A JOIN (SELECT id, nickname, thumbnail FROM users WHERE isDeleted = false) AS B ON A.creatorId = B.id ORDER BY A.createdAt DESC`
        let [result] = await conn.query(sql)

        // 결과 값을 프론트의 Room 모델과 맞춰주는 과정
        result = result.map(room => {
          room.user = {
            nickname: room.nickname,
            thumbnail: room.thumbnail
          }
          delete room.nickname
          delete room.thumbnail
          return room
        })

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
        return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  // @desc : 방에 참가했는지 확인
  // @url : http://localhost:3001/api/rooms/writeable
  // @method : GET
  // @query : roomId: string, userId: string
  api.get('/writeable', (req, res) => {
    const roomId = req.query.roomId
    const userId = req.query.userId

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

        let total = 0
        if (result[0]) {
          total = result[0].total
        }

        return res.json(messages.SUCCESS({ total: total }))
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  // @desc : 방 인원 제한 출력
  // @url : http://localhost:3001/api/rooms/writerLimit
  // @method : GET
  // @query : roomId: string
  api.get('/writerLimit', (req, res) => {
    const roomId = req.query.roomId

    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = `SELECT writerLimit FROM rooms WHERE id = ?`
        const field = [roomId]
        const [result] = await pool.query(sql, field)

        let writerLimit = 0
        if (result[0]) {
          writerLimit = result[0].writerLimit
        }

        return res.json(messages.SUCCESS({ writerLimit: writerLimit }))
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
        const [result] = await pool.query(sql, field)

        let isLike = false
        if (result[0]) {
          isLike = result[0].isLike
        }

        return res.json(messages.SUCCESS({ isLike: isLike }))
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
  // @body : userId: string, writerLimit?: String, tags?: String, title: String, desc?: String, coverImage?: string
  api.post('/', (req, res) => {
    const writerLimit = req.body.writerLimit
    const tags = req.body.tags
    const title = req.body.title
    const desc = req.body.desc
    const creatorId = req.body.userId
    const genre = req.body.genre
    const coverImage = req.body.coverImage

    const runQuery = async (errHandlerCallback) => {
      const conn = await pool.getConnection()

      try {
        await conn.query('START TRANSACTION')
        const sql = 'INSERT INTO rooms SET ?'
        const fields = {
          writerLimit,
          tags,
          title,
          desc,
          creatorId,
          genre,
          coverImage
        }
        const [{
          insertId
        }] = await conn.query(sql, fields)
        const createdRoomId = insertId

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

        const sql5 = `INSERT INTO commentsInfo SET ?`
        const fields5 = {
          roomId: createdRoomId
        }
        await conn.query(sql5, fields5)

        await conn.query('COMMIT')
        await conn.release()

        return res.status(201).json(messages.SUCCESS({ insertId: insertId }))
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
  // @body: roomId: string, userId: string
  api.post('/join', (req, res) => {
    const roomId = req.body.roomId
    const userId = req.body.userId

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
