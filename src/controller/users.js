module.exports = (conn) => {
  const errHandler = require('../errorHandler')
  const api = require('express').Router()
  const hasher = require('pbkdf2-password')()
  const messages = require('../messages')
  const { checkLoggedIn } = require('../middleware/authenticate')

  // @desc: 모든 users 값 가져옴
  // @url: http://localhost:3001/api/users/
  // @method: GET
  api.get('/', (req, res) => {
    const runQuery = async (errHandlerCallback) => {
      const sql = 'SELECT * FROM users'

      try {
        const [results] = await conn.query(sql)
        return res.json(messages.SUCCESS_DATA(results))
      } catch (err) {
        if (err) return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler)
  })

  // @desc: 유저 생성
  // @url: http://localhost:3001/api/users/
  // @method: POST
  api.post('/', (req, res) => {
    const email = req.body.email
    const nickname = req.body.nickname
    const password = req.body.password
    const thumbnail = req.file
    const type = req.body.type

    const runQuery = (errHandlerCallback) => {
      const hasherCallback = async (err, pass, salt, hash) => {
        if (err) return errHandlerCallback(err)

        const sql = `INSERT INTO users SET ?`
        const fields = { nickname, email, 'password': hash, salt, thumbnail, type }

        try {
          await conn.query(sql, fields)
          return res.json(messages.SUCCESS_MSG)
        } catch (err) {
          return errHandlerCallback(err)
        }
      }

      return hasher({ password }, hasherCallback)
    }

    return runQuery(errHandler(res))
  })

  // @desc : 자신의 유저 정보 가져오기
  // @url : http://localhost:3001/api/users/me
  // @method : GET
  api.get('/me', checkLoggedIn, async (req, res) => {
    const user = req.user

    try {
      return res.status(200).json({
        data: user
      })
    } catch (err) {
      return res.status(500).json(messages.ERROR(err))
    }
  })

  return api
}
