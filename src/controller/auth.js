module.exports = () => {
  const api = require('express').Router()
  const passport = require('passport')
  const messages = require('../messages')
  const errorHandler = require('../queryErrorHandler')
  const config = require('../config')

  // @desc : login 실패시 failureRedircet에 의해 작동되는 라우터
  // @url : http://localhost:3001/api/auth/session/fail
  // @method : GET
  api.get('/session/fail', (req, res) => {
    const err = {
      Internal_error: req.flash('Internal_error')[0],
      error: req.flash('error')[0]
    }

    if (err.Internal_error) return res.status(500).json(messages.ERROR(err.Internal_error))
    else return res.status(400).json(messages.ERROR(err.error))
  })

  // @desc : login 성공시
  // @url : http://localhost:3001/api/auth/session/success
  // @method : GET
  api.get('/session/success', (req, res) => {
    let user = req.user
    res.status(200).json(messages.SUCCESS(user))
  })

  // @desc : 로컬 로그인
  // @url : http://localhost:3001/api/auth/session
  // @method : POST
  // @body : email: String, password: String
  api.post('/session', passport.authenticate('local', {
    session: true,
    failureRedirect: '/api/auth/session/fail',
    failureFlash: true
  }), (req, res) => {
    // 성공시
    res.redirect('/api/auth/session/success')
  })

  // @desc : 로컬 & 페이스북 로그아웃
  // @url : http://localhost:3001/api/auth/session
  // @method : GET
  api.get('/session', (req, res) => {
    const run = (errHandlerCallback) => {
      if (!req.user) return res.status(409).json(messages.SESSION_NOT_FOUND)

      // 클라이언트 세션 삭제
      req.session.destroy(err => {
        if (err) return errHandlerCallback(err)
      })
      // 클라이언트 세션 쿠기 삭제
      res.clearCookie(config.SESSION_COOKIE_KEY)

      req.logout()
      return res.status(200).json(messages.SUCCESS())
    }

    return run(errorHandler(res))
  })

  // @desc : 페이스북 로그인
  // @url : http://localhost:3001/api/auth/facebook
  // @method : GET
  api.get('/facebook', passport.authenticate('facebook', {
    scope: 'email'
  }))

  // @desc : 페이스북 로그인 실패, 성공시 거쳐가는 콜백
  // @url : http://localhost:3001/api/auth/facebook/callback'
  // @method : GET
  api.get('/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/api/auth/session/success',
    failureRedirect: '/api/auth/facebook/fail'
  }))

  // @desc : 페이스북 로그인 실패
  // @url : http://localhost:3001/api/auth/facebook/fail'
  // @method : GET
  api.get('/facebook/fail', (req, res) => {
    return res.status(500).json(messages.FACEBOOK_LOGIN_FAIL)
  })

  return api
}
