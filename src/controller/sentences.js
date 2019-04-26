module.exports = (pool) => {
  const api = require('express').Router()
  const messages = require('../messages')
  const errorHandler = require('../queryErrorHandler')

  // @desc : 소설 글 가져오기
  // @url : http://localhost:3001/api/sentences
  // @method : GET
  // @query: roomId: string, sentenceId?: string, skip?: string, limit?: string, userId?: string
  api.get('/', (req, res) => {
    const roomId = req.query.roomId
    const skip = req.query.skip || 0
    const limit = req.query.limit || 30
    const sentenceId = req.query.sentenceId
    const userId = req.query.userId

    const runQuery = async (errHandlerCallback) => {
      try {
        if (sentenceId) {
          const sql = `SELECT id, text, updatedAt, createdAt, updatedAt, \`like\`, dislike FROM sentences WHERE id = ? AND isDeleted = ?`
          const filters = [sentenceId, false]
          const [result] = await pool.query(sql, filters)
          return res.json(messages.SUCCESS(result))
        } else if (userId) {
          // TODO: 아래 코드 분리
          const sql = `SELECT id, isLike, \`text\`, updatedAt, createdAt, \`like\`, dislike FROM (SELECT id, \`text\`, userId, updatedAt, createdAt, \`like\`, dislike FROM sentences WHERE roomId = ? AND isDeleted = ?) AS A LEFT JOIN (SELECT sentenceId, userId, isLike FROM sentencesLikes WHERE roomId = ? AND userId = ? AND isDeleted = ?) AS B ON A.id = B.sentenceId ORDER BY A.createdAt ASC LIMIT ${skip}, ${limit}`
          const filters = [roomId, false, roomId, userId, false]
          const [result] = await pool.query(sql, filters)
          return res.json(messages.SUCCESS(result))
        } else {
          const sql = `SELECT id, text, userId, updatedAt, updatedAt, \`like\`, dislike FROM sentences WHERE roomId = ? AND isDeleted = ? ORDER BY createdAt ASC LIMIT ${skip}, ${limit}`
          const filters = [roomId, false]
          const [result] = await pool.query(sql, filters)
          return res.json(messages.SUCCESS(result))
        }
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errorHandler(res))
  })

  // @desc : room에 속한 소설글의 총합 출력
  // @url : http://localhost:3001/api/sentences/total
  // @method : GET
  // @query : roomId: string
  api.get('/total', (req, res) => {
    const roomId = req.query.roomId

    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = `SELECT total FROM sentencesInfo WHERE roomId = ?`
        const fields = [roomId]
        const [result] = await pool.query(sql, fields)

        return res.json(messages.SUCCESS(result))
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errorHandler(res))
  })

  // @desc : 소설 글 쓰기
  // @url : http://localhost:3001/api/sentences
  // @method : POST
  // @body: roomId: string, text: string, userId: string
  api.post('/', (req, res) => {
    const text = req.body.text
    const userId = req.body.userId
    const roomId = req.body.roomId

    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = 'INSERT INTO sentences SET text = ?, userId = ?, roomId = ?'
        const fields = [text, userId, roomId]
        const [result] = await pool.query(sql, fields)

        return res.status(201).json(messages.SUCCESS(result))
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errorHandler)
  })

  // @desc : 글 좋아요, 싫어요 추가 및 수정
  // @url : http://localhost:3001/api/sentences/likedislikes
  // @method : POST
  // @body: userId: string, sentenceId: string, roomId: string, isLike: boolean
  api.post('/likedislikes', (req, res) => {
    // TOOD: 라우터 이름 바꾸기 to => like
    const sentenceId = req.body.sentenceId
    const roomId = req.body.roomId
    const isLike = req.body.isLike
    const userId = req.body.userId

    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = 'INSERT INTO sentenceslikes(sentenceId, userId, roomId, isLike) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE isLike = ?'
        const fields = [sentenceId, userId, roomId, isLike, isLike]
        const [result] = await pool.query(sql, fields)

        return res.status(201).json(messages.SUCCESS(result))
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errorHandler)
  })

  return api
}
