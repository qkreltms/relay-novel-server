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
      if (err) return res.status(500).json(messages.ERROR(err))

      return res.json(messages.SUCCESS(results[0]))
    }

    conn.query(sql, queryCallback)
  })

  api.post('/', async (req, res) => {
    let email = req.body.email
    let nickname = req.body.nickname
    let password = req.body.password
    let thumbnail = req.file
    let type = req.body.type

    // TODO: 닉네임, 이메일 중복처리

    let hasherCallback = async (err, pass, salt, hash) => {
      if (err) {
        return res.status(500).json(messages.ERROR(err))
      }

      const sql = `INSERT INTO users set ?`
      const fields = { nickname, email, password: hash, salt, thumbnail, type }
      const queryCallback = (err, results) => {
        if (err) {
          return res.status(500).json(messages.ERROR(err))
        }

        return res.json(messages.SUCCESS)
      }

      conn.query(sql, fields, queryCallback)
    }

    return hasher({ password }, hasherCallback)
  })

  return api
}
