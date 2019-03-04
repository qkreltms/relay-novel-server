const mysql = require('mysql')
const config = require('./')
const dbConfig = {
  connectionLimit: 10,
  host: config.DB_HOST,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  database: config.DB_DATABASE,
  waitForConnections: true
}

const pool = mysql.createPool(dbConfig)
const app = require('express')()

if (app.get('env') === 'development') {
  pool.on('acquire', (connection) => {
    console.log('Connection %d acquired', connection.threadId)
  })

  pool.on('release', function (connection) {
    console.log('Connection %d released', connection.threadId)
  })

  pool.on('enqueue', function () {
    console.log('Waiting for available connection slot')
  })

  pool.on('error', (err) => {
    console.log(err)
  })
}

module.exports = {
  pool
}
