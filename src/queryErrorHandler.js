module.exports = (res) => {
  const messages = require('./messages')

  return (err) => {
    err = err || {}
    err = {
      code: err.code || '',
      name: err.name || '',
      message: err.message || '',
      stack: err.stack || ''
    }
    // TODO: production 모드에서는 콘솔 비활성화하기
    console.info('@@ERROR@@:\n', err)

    switch (err.code) {
      case 'ER_DUP_ENTRY': {
        return res.status(409).json(messages.ERROR(err))
      }
      case 'ER_SIGNAL_EXCEPTION': {
        return res.status(409).json(messages.ERROR(err))
      }
      default: {
        return res.status(500).json(messages.ERROR(err))
      }
    }
  }
}
