module.exports = (pool) => {
  const api = require('express').Router()
  const { checkLoggedIn } = require('../middleware/authenticate')
  const messages = require('../messages')
  const errorHandler = require('../queryErrorHandler')
  api.get('/', (req, res) => {
    const roomId = req.query.roomId
    const skip = req.query.skip || 0
    const limit = req.query.limit || 30

    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = `SELECT id, text, userId, updatedAt, like FROM sentences WHERE roomId = ? ORDER BY updatedAt ASC LIMIT ${skip}, ${limit}`
        const filters = [roomId]
        const [result] = await pool.query(sql, filters)

        return res.json(messages.SUCCESS(result))
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errorHandler(res))
  })

  api.post('/', checkLoggedIn, (req, res) => {
    const text = req.body.text
    const userId = req.user.id
    const roomId = req.body.roomId

    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = 'INSERT INTO sentences SET ?'
        const fields = { text, userId, roomId }
        await pool.query(sql, fields)

        return res.status(201).json(messages.SUCCESS())
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errorHandler(res))
  })

  // api.delete('/', (req, res) => {
  //   const sentenceId = req.body.sentenceId
  //   const userId = req.user.id
  //   const roomId = req.body.roomId

  //   const runQuery = async (errHandlerCallback) => {
  //     try {
  //       const sql = `SELECT CAST( CASE creatorId WHEN ? THEN 1 ELSE 0 END AS BINARY ) AS isCreator FROM rooms WHERE id = ?`
  //       const filter = [ userId, roomId ]
  //       const result = await pool.query(sql, filter)
  //       console.log(result)

  //       const sql2 = 'DELETE FROM sentences WHERE id = ?'
  //       const filters2 = [ sentenceId ]
  //       const [{ affectedRows }] = await pool.query(sql2, filters2)

  //       return res.json(messages.SUCCESS('', affectedRows))
  //     } catch (err) {
  //       return errHandlerCallback(err)
  //     }
  //   }

  //   return runQuery(errorHandler(res))
  // })

  // api.patch('/', (req, res) => {
  //   const sentenceId = req.body.sentenceId
  //   const text = req.body.text

  //   const runQuery = async (errHandlerCallback) => {
  //     try {
  //       const sql = 'UPDATE sentences SET text = ? WHERE id = ?'
  //       const filters = [ text, sentenceId ]
  //       const [{ affectedRows }] = await pool.query(sql, filters)

  //       return res.json(messages.SUCCESS('', affectedRows))
  //     } catch (err) {
  //       return errHandlerCallback(err)
  //     }
  //   }

  //   return runQuery(errorHandler(res))
  // })

  return api
}
