module.exports = (pool) => {
  const errHandler = require('../queryErrorHandler')
  const api = require('express').Router()
  const messages = require('../messages')
  const { checkLoggedIn } = require('../middleware/authenticate')
  const config = require('../config')

  // @desc : 자신의 유저 정보 가져오기
  // @url : http://localhost:3001/api/users/me
  // @method : GET
  api.get('/me', checkLoggedIn, async (req, res) => {
    const user = req.user

    try {
      return res.json(messages.SUCCESS(user))
    } catch (err) {
      return res.status(500).json(messages.ERROR(err))
    }
  })

  // @desc: 유저 찾기
  // @url: http://localhost:3001/api/users
  // @method: GET
  // @query: email: string
  api.get('/', (req, res) => {
    const email = req.query.email

    const runQuery = async (errHandlerCallback) => {
      try {
        const [result] = await pool.query('SELECT email FROM users WHERE email = ?', [email])

        return res.json(messages.SUCCESS(result))
      } catch (err) {
        return errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  // @desc: 유저 삭제
  // @url: http://localhost:3001/api/users
  // @method: DELETE
  api.delete('/', checkLoggedIn, (req, res) => {
    const userId = req.user.id

    const runQuery = async (errHandlerCallback) => {
      try {
        // 클라이언트 세션 삭제
        req.session.destroy(err => {
          if (err) return errHandlerCallback(err)
        })
        // 클라이언트 세션 쿠기 삭제
        res.clearCookie(config.SESSION_COOKIE_KEY)
        req.logout()

        const sql = `UPDATE users SET isDeleted = ? WHERE id = ?`
        const fields = [ true, userId ]
        const [result] = await pool.query(sql, fields)

        return res.json(messages.SUCCESS(result))
      } catch (err) {
        errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  // @desc: 유저 삭제 취소
  // @url: http://localhost:3001/api/users
  // @method: PATCH
  api.patch('/', checkLoggedIn, (req, res) => {
    const userId = req.user.id

    const runQuery = async (errHandlerCallback) => {
      try {
        const sql = `UPDATE users SET isDeleted = ? WHERE id = ?`
        const fields = [ false, userId ]
        const [result] = await pool.query(sql, fields)

        return res.status(204).json(messages.SUCCESS(result))
      } catch (err) {
        errHandlerCallback(err)
      }
    }

    return runQuery(errHandler(res))
  })

  return api
}
