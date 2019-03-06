module.exports = (app) => {
  const config = require('./')
  const session = require('express-session')
  const MySQLStore = require('express-mysql-session')
  const thirtyDaysToMillis = 30 * 86400 * 1000
  const fifteenthDaysToMillis = thirtyDaysToMillis * 0.5
  const expiry = new Date(Date.now() + thirtyDaysToMillis)

  const mysqlOpt = {
    host: config.DB_HOST,
    port: 3306,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_DATABASE,
    clearExpired: true,
    checkExpirationInterval: fifteenthDaysToMillis,
    expiration: thirtyDaysToMillis,
    createDatabaseTable: true
  }
  const sessionOpt = {
    name: config.SESSION_COOKIE_KEY,
    secret: config.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    store: new MySQLStore(mysqlOpt),
    cookie: {
      maxAge: expiry,
      httpOnly: true
    },
    unset: 'destroy'
  }

  app.use(session(sessionOpt))
}
