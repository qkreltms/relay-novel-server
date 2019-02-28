module.exports = (db) => {
  const api = require('express').Router()

  // @desc: 모든 users 값 가져옴
  // @method: GET
  // @url: http://localhost:3001/api/users/
  api.get('/', (req, res) => {
    const sql = 'select * from users'
    db.query(sql, (err, results) => {
      if (err) return res.status(500).json({ message: err })

      return res.json({ message: results })
    })
  })

  api.post('/', async (req, res) => {

  })

  return api
}
