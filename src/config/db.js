const mysql = require('mysql')
const config = require('./')
const dbConfig = {
  connectionLimit: 10,
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
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
}

module.exports = {
  pool
}
