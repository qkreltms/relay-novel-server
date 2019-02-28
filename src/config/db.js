const mysql = require('mysql')

const db = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 111111,
  database: 'relay_novel',
  waitForConnections: true
})

module.exports = {
  db
}
