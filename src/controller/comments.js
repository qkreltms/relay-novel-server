module.exports = (pool) => {
  const api = require('express').Router()
  const messages = require('../messages')
  const errorHandler = require('../queryErrorHandler')

  // @desc : 소설 글 가져오기
  // @url : http://localhost:3001/api/comments
  // @method : GET
  // @query: roomId: string, skip?: string, limit?: string, userId?: string
  api.get('/', (req, res) => {
    const roomId = req.query.roomId
    const skip = req.query.skip || 0
    const limit = req.query.limit || 30
    const userId = req.query.userId

    const runQuery = async (errHandlerCallback) => {
      try {
        if (userId) {
          // 댓글 배열 값에 내가 좋아요 누른 값 포함시킴
          const sql = `SELECT id, isLike, \`text\`, updatedAt, createdAt, \`like\`, dislike FROM (SELECT id, \`text\`, userId, updatedAt, createdAt, \`like\`, dislike FROM comments WHERE roomId = ? AND isDeleted = ?) AS A LEFT JOIN (SELECT commentId, userId, isLike FROM commentLikes WHERE roomId = ? AND userId = ? AND isDeleted = ?) AS B ON A.id = B.commentId ORDER BY A.createdAt ASC LIMIT ${skip}, ${limit}`
          const filters = [roomId, false, roomId, userId, false]
          const [result] = await pool.query(sql, filters)
          return res.json(messages.SUCCESS(result))
          // 댓글 배열 값 출력
        } else {
          const sql = `SELECT id, text, userId, updatedAt, updatedAt, \`like\`, dislike FROM comments WHERE roomId = ? AND isDeleted = ? ORDER BY createdAt ASC LIMIT ${skip}, ${limit}`
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

  // @desc : 댓글 쓰기
  // @url : http://localhost:3001/api/comments
  // @method : POST
  // @body: roomId: string, text: string, userId: string
  api.post('/', (req, res) => {
    const text = req.body.text
    const userId = req.body.userId
    const roomId = req.body.roomId

    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = 'INSERT INTO comments SET text = ?, userId = ?, roomId = ?'
        const fields = [text, userId, roomId]
        const [result] = await pool.query(sql, fields)

        return res.status(201).json(messages.SUCCESS(result))
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errorHandler)
  })

  // @desc : 댓글 좋아요, 싫어요 추가 및 수정
  // @url : http://localhost:3001/api/comments/likedislikes
  // @method : POST
  // @body: userId: string, commentId: string, roomId: string, isLike: boolean
  api.post('/likedislikes', (req, res) => {
    const commentId = req.body.commentId
    const roomId = req.body.roomId
    const isLike = req.body.isLike
    const userId = req.body.userId

    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = 'INSERT INTO commentslikes(commentId, userId, roomId, isLike) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE isLike = ?'
        const fields = [commentId, userId, roomId, isLike, isLike]
        const [result] = await pool.query(sql, fields)

        // 업데이트 시에는 204 반환
        if (result.affectedRows >= 2) {
          return res.status(204).json(messages.SUCCESS(result))
        }
        return res.status(201).json(messages.SUCCESS(result))
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errorHandler)
  })

  return api
}
