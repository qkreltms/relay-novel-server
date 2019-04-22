module.exports = (pool) => {
  const api = require('express').Router()
  const {
    checkLoggedIn
  } = require('../middleware/authenticate')
  const messages = require('../messages')
  const errorHandler = require('../queryErrorHandler')

  // @desc : 소설 글 가져오기
  // @url : http://localhost:3001/api/sentences
  // @method : GET
  // @query: roomId: string, sentenceId?: string
  api.get('/', (req, res) => {
    const roomId = req.query.roomId
    const skip = req.query.skip || 0
    const limit = req.query.limit || 30
    const sentenceId = req.query.sentenceId

    const runQuery = async (errHandlerCallback) => {
      try {
        if (sentenceId) {
          const sql = `SELECT text, updatedAt, createdAt FROM sentences WHERE roomId = ? AND id = ? AND isDeleted = ? ORDER BY createdAt ASC LIMIT ${skip}, ${limit}`
          const filters = [roomId, sentenceId, false]
          const [result] = await pool.query(sql, filters)
          return res.status(200).json(messages.SUCCESS(result))
        } else {
          const sql = `SELECT id, text, userId, updatedAt FROM sentences WHERE roomId = ? AND isDeleted = ? ORDER BY createdAt ASC LIMIT ${skip}, ${limit}`
          const filters = [roomId, false]
          const [result] = await pool.query(sql, filters)
          return res.status(200).json(messages.SUCCESS(result))
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

        return res.status(200).json(messages.SUCCESS(result))
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errorHandler(res))
  })

  // @desc : 소설 글 쓰기
  // @url : http://localhost:3001/api/sentences
  // @method : POST
  // @body: roomId: string, text: string
  api.post('/', checkLoggedIn, (req, res) => {
    const text = req.body.text
    const userId = req.user.id
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

  return api
}
