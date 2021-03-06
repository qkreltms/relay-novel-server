module.exports = async (startDBCallback) => {
  const mysql = require('mysql2')
  const config = require('./')
  const messages = require('../messages')
  const dbConfig = {
    connectionLimit: 10,
    host: config.DB_HOST,
    user: config.DB_USER,
    password: config.DB_PASSWORD,
    database: config.DB_DATABASE,
    waitForConnections: true
  }
  try {
    const pool = await mysql.createPool(dbConfig).promise()
    const app = require('express')()

    if (app.get('env') === 'development') {
      pool.on('acquire', (connection) => {
        console.log('Connection %d acquired', connection.threadId)
      })

      pool.on('release', (connection) => {
        console.log('Connection %d released', connection.threadId)
      })

      pool.on('enqueue', () => {
        console.log('Waiting for available connection slot')
      })

      pool.on('error', (err) => {
        console.log(err)
      })
    }

    return startDBCallback(pool)
  } catch (err) {
    console.log(messages.ERROR(err))
  }
}
