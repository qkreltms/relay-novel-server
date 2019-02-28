require('dotenv').config()

module.exports = {
  'port': process.env.PORT || 3001,
  'host': process.env.host,
  'user': process.env.user,
  'password': process.env.password,
  'database': process.env.database
}
