module.exports = (res) => {
  const messages = require('./messages')

  return (err) => {
    err = err || {}
    err.code = err.code || ''

    console.info('@@ERROR CODE@@:', err.code)
    switch (err.code) {
      case 'ER_DUP_ENTRY': {
        return res.status(409).json(messages.ERROR(err))
      }
      default: {
        return res.status(500).json(messages.ERROR(err))
      }
    }
  }
}
