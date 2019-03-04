module.exports = (app) => {
  const conn = require('../config/db').pool
  const passport = require('passport')
  const messages = require('../messages')
  // const FacebookStrategy = require('passport-facebook').Strategy
  const LocalStrategy = require('passport-local').Strategy
  const bkfd2Password = require('pbkdf2-password')
  const hasher = bkfd2Password()

  app.use(passport.initialize())
  app.use(passport.session())

  // 세션 식별 id 쿠기 생성
  passport.serializeUser(function (user, done) {
    return done(null, user.id)
  })

  passport.deserializeUser(function (id, done) {
    const sql = 'SELECT * FROM users WHERE id = ?'
    const fields = [id]
    const queryCallback = (err, user) => {
      return done(err, user[0])
    }

    conn.query(sql, fields, queryCallback)
  })

  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, (req, userEmail, password, done) => {
    const sql = 'SELECT id, salt, password FROM users WHERE email = ?'
    const filter = [userEmail]
    const queryCallback = (err, user) => {
      user = user[0]
      if (err) return done(null, false, req.flash('internal_error', err))
      // 이메일 매칭되서 유저 값 받았는지 확인
      if (!user) return done(null, false, req.flash('error', messages.INCORRECT_USERNAME))

      const hasherCallback = (err, pass, salt, hash) => {
        if (err) return done(null, false, req.flash('internal_error', err))
        // 비밀번호 매칭되는지 확인
        if (hash !== user.password) return done(null, false, req.flash('error', messages.INCORRECT_PASSWORD))

        return done(null, user)
      }

      return hasher({
        password,
        salt: user.salt
      }, hasherCallback)
    }

    conn.query(sql, filter, queryCallback)
  }))

  // passport.use(new FacebookStrategy({
  //   clientID: init.clientID,
  //   clientSecret: init.clientSecret,
  //   callbackURL: '/api/auth/facebook/callback',
  //   profileFields: ['id', 'name', 'email', 'displayName', 'photos']
  // }, async function (accessToken, refreshToken, profile, done) {
  //   let type = 'facebook'

  //   let filter = {
  //     email: profile.emails[0].value
  //   }
  //   let update = {
  //     $set: {
  //       type: type,
  //       email: profile.emails[0].value,
  //       displayName: profile.displayName,
  //       profile: profile.photos ? profile.photos[0].value : init.defaultProfile,
  //       thumbnail: profile.photos ? profile.photos[0].value : init.defaultProfile
  //     }
  //   }
  //   let option = {
  //     new: true,
  //     upsert: true
  //   }

  //   try {
  //     let user = await User.findOneAndUpdate(filter, update, option)
  //     return done(null, user)
  //   } catch (err) {
  //     return done(err)
  //   }
  // }))
}
