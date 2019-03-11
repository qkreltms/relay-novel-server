module.exports = (conn) => {
  const errHandler = require('../queryErrorHandler')
  const api = require('express').Router()
  const hasher = require('pbkdf2-password')()
  const messages = require('../messages')
  const { checkLoggedIn } = require('../middleware/authenticate')
  const config = require('../config')

  // @desc: 모든 users 값 가져옴
  // @url: http://localhost:3001/api/users/
  // @method: GET
  // TODO: 한번에 30개씩 개수제한
  api.get('/', (req, res) => {
    const runQuery = async (errHandlerCallback) => {
      try {
        const [results] = await conn.query('SELECT * FROM users')

        return res.json(messages.SUCCESS(results))
      } catch (err) {
        if (err) return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  // @desc: 유저 생성
  // @url: http://localhost:3001/api/users/
  // @method: POST
  api.post('/', (req, res) => {
    const email = req.body.email
    const nickname = req.body.nickname
    const password = req.body.password
    const thumbnail = req.file

    // todo typecheck 및 값 들어왔는지 확인 필수!
    const runQuery = (errHandlerCallback) => {
      const hasherCallback = async (err, pass, salt, hash) => {
        if (err) return errHandlerCallback(err)

        try {
          let [existsUser] = await conn.query(`SELECT * FROM users WHERE email = ?`, [email])
          existsUser = existsUser[0]
          // 유저가 이미 존재하면
          if (existsUser) return res.status(409).json(messages.USER_IS_ALREADY_EXISTS)

          const fields = { nickname, email, 'password': hash, salt, thumbnail }
          await conn.query('INSERT INTO users SET ?', fields)

          return res.json(messages.SUCCESS())
        } catch (err) {
          return errHandlerCallback(err)
        }
      }

      return hasher({ password }, hasherCallback)
    }

    return runQuery(errHandler(res))
  })

  api.delete('/', (req, res) => {
    const email = req.body.email

    const runQuery = async (errHandlerCallback) => {
      try {
        // 클라이언트 세션 삭제
        req.session.destroy(err => {
          if (err) return errHandlerCallback(err)
        })
        // 클라이언트 세션 쿠기 삭제
        res.clearCookie(config.SESSION_COOKIE_KEY)
        req.logout()

        const [{ affectedRows }] = await conn.query('DELETE FROM users WHERE email = ?', [email])

        return res.status(200).json(messages.SUCCESS('', affectedRows))
      } catch (err) {
        errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  // @desc : 자신의 유저 정보 가져오기
  // @url : http://localhost:3001/api/users/me
  // @method : GET
  api.get('/me', checkLoggedIn, async (req, res) => {
    const user = req.user

    try {
      return res.status(200).json(messages.SUCCESS(user))
    } catch (err) {
      return res.status(500).json(messages.ERROR(err))
    }
  })

  return api
}
