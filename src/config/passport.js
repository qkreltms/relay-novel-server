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

  initializeDB((conn) => {
    // 세션 식별 id 쿠기 생성
    passport.serializeUser((user, done) => {
      try {
        return done(null, user.id)
      } catch (err) {
        return done(err)
      }
    })

    passport.deserializeUser(async (id, done) => {
      const sql = 'SELECT * FROM users WHERE id = ?'
      const fields = [id]
      try {
        const [user] = await conn.query(sql, fields)
        return done(null, user[0])
      } catch (err) {
        return done(err)
      }
    })

    passport.use(new LocalStrategy({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    }, async (req, userEmail, password, done) => {
      const sql = 'SELECT id, salt, password FROM users WHERE email = ?'
      const filter = [userEmail]

      try {
        let [user] = await conn.query(sql, filter)
        user = user[0]

        // 이메일 매칭되서 유저 값 받았는지 확인
        if (!user) return done(null, false, req.flash('error', messages.INCORRECT_USERNAME))

        const hasherCallback = (err, pass, salt, hash) => {
          if (err) return done(null, false, req.flash('Internal_error', err))
          // 비밀번호 매칭되는지 확인
          if (hash !== user.password) return done(null, false, req.flash('error', messages.INCORRECT_PASSWORD))

          return done(null, user)
        }

        return hasher({
          password,
          salt: user.salt
        }, hasherCallback)
      } catch (err) {
        return done(null, false, req.flash('Internal_error', err))
      }
    }))

    passport.use(new FacebookStrategy({
      clientID: config.FACEBOOK_CLIENT_ID,
      clientSecret: config.FACEBOOK_CLIENT_SECRET,
      callbackURL: '/api/auth/facebook/callback',
      profileFields: ['id', 'name', 'email', 'displayName', 'photos']
    }, async (accessToken, refreshToken, profile, done) => {
      console.log('Is it works??')
      const type = 'facebook'
      const nickname = profile.displayName
      const email = profile.emails[0].value
      const thumbnail = profile.photos[0].value
      try {
        let [existsUser] = await conn.query(`SELECT * FROM users WHERE email = ?`, [email])
        existsUser = existsUser[0]
        // 유저가 이미 존재하면
        if (existsUser) return done(null, existsUser)

        const fields = { nickname, email, thumbnail, type }
        await conn.query(`INSERT INTO users SET ?`, fields)
        let [createdUser] = await conn.query(`SELECT * FROM users WHERE email = ?`, [email])
        createdUser = createdUser[0]

        return done(null, createdUser)
      } catch (err) {
        return done(err)
      }
    }))
  })
}
