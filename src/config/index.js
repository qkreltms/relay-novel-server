require('dotenv').config()

module.exports = {
  'PORT': process.env.PORT || 3001,
  'DB_HOST': process.env.DB_HOST,
  'DB_USER': process.env.DB_USER,
  'DB_PASSWORD': process.env.DB_PASSWORD,
  'DB_DATABASE': process.env.DB_DATABASE,
  'SESSION_SECRET_KEY': process.env.SESSION_SECRET_KEY
}
