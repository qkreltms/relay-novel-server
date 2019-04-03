module.exports = (app) => {
  const initializeDB = require('./db')
  const passport = require('passport')
  const messages = require('../messages')
  const FacebookStrategy = require('passport-facebook').Strategy
  const LocalStrategy = require('passport-local').Strategy
  const bkfd2Password = require('pbkdf2-password')
  const hasher = bkfd2Password()
  const config = require('./')

  app.use(passport.initialize())
  app.use(passport.session())

  initializeDB((pool) => {
    // 세션 식별 id 쿠기 생성
    passport.serializeUser((userId, done) => {
      try {
        return done(null, userId)
      } catch (err) {
        return done(err)
      }
    })

    passport.deserializeUser(async (id, done) => {
      const sql = 'SELECT ??, ??, ??, ??, ??, ??, ??, ??, ??, ?? FROM users WHERE id = ?'
      const fields = ['id', 'nickname', 'email', 'thumbnail', 'isAdmin', 'isBlocked', 'type', 'updatedAt', 'createdAt', 'isDeleted', id]
      try {
        const [[user]] = await pool.query(sql, fields)
        // 유저가 없을 경우 종료
        if (!user) return done(null, false)

        return done(null, user)
      } catch (err) {
        return done(err)
      }
    })

    passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    }, async (req, userEmail, password, done) => {
      try {
        const sql = 'SELECT id, salt, password FROM users WHERE email = ? AND type = ?'
        const fields = [userEmail, 'local']

        const [[user]] = await pool.query(sql, fields)

        // 이메일 매칭되서 유저 값 받았는지 확인
        if (!user) return done(null, false, req.flash('error', messages.INCORRECT_USERNAME))

        const hasherCallback = (err, pass, salt, hash) => {
          if (err) return done(null, false, req.flash('Internal_error', err))
          // 비밀번호 매칭되는지 확인
          if (hash !== user.password) return done(null, false, req.flash('error', messages.INCORRECT_PASSWORD))

          return done(null, user.id)
        }

        return hasher({
          password,
          salt: user.salt
        }, hasherCallback)
      } catch (err) {
        return done(null, false, req.flash('Internal_error', err))
      }
    }))

    // INFO: 페이스북 로그인은 중복값 허용이 안되니, 트랜잭션 처리 안함
    passport.use(new FacebookStrategy({
      clientID: config.FACEBOOK_CLIENT_ID,
      clientSecret: config.FACEBOOK_CLIENT_SECRET,
      callbackURL: '/api/auth/facebook/callback',
      profileFields: ['id', 'name', 'email', 'displayName', 'photos']
    }, async (accessToken, refreshToken, profile, done) => {
      const type = 'facebook'
      const nickname = profile.displayName
      const email = profile.emails[0].value
      const thumbnail = profile.photos[0].value
      try {
        const [[existsUser]] = await pool.query(`SELECT id FROM users WHERE email = ? AND type = ?`, [email, type])

        // 유저가 이미 존재하면 빠져나감
        if (existsUser) return done(null, existsUser.id)

        const fields = { nickname, email, thumbnail, type }
        const [result] = await pool.query(`INSERT INTO users SET ?`, fields)

        return done(null, result.insertId)
      } catch (err) {
        return done(err)
      }
    }))
  })
}
