module.exports = (res, messages) => {
  return (err) => {
    console.warn('@@ERROR CODE@@:', err.code)
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
