module.exports = (conn) => {
  const api = require('express').Router()
  const hasher = require('pbkdf2-password')()
  const messages = require('../messages')

  // @desc: 모든 users 값 가져옴
  // @url: http://localhost:3001/api/users/
  // @method: GET
  api.get('/', (req, res) => {
    const sql = 'SELECT * FROM users'
    const queryCallback = (err, results) => {
      if (err) throw err
      if (!(results.length > 0)) throw err
      return res.json(messages.SUCCESS_DATA(results[0]))
    }

    try {
      conn.query(sql, queryCallback)
    } catch (err) {
      return res.status(500).json(messages.ERROR(err))
    }
  })

  api.post('/', (req, res) => {
    const email = req.body.email
    const nickname = req.body.nickname
    const password = req.body.password
    const thumbnail = req.file
    const type = req.body.type

    const runQuery = (handleErrCallback) => {
      const hasherCallback = (err, pass, salt, hash) => {
        if (err) return handleErrCallback(err)

        const sql = `INSERT INTO users SET ?`
        const fields = { nickname, email, 'password': hash, salt, thumbnail, type }
        const queryCallback = (err) => {
          if (err) return handleErrCallback(err)

          return res.json(messages.SUCCESS_MSG)
        }
        conn.query(sql, fields, queryCallback)
      }

      return hasher({ password }, hasherCallback)
    }

    return runQuery((err) => {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json(messages.ERROR(err))
      }
      return res.status(500).json(messages.ERROR(err))
    })
  })

  return api
}
