
module.exports.INVALID_QUERY_PARAMETER = { status: 'error', message: 'Invalid query parameter.' }
module.exports.INVALID_POST_REQUEST = { status: 'error', message: 'Invaild post request. Check your data exist or have proper types' }

module.exports.ACCESS_DENIED = { status: 'error', message: 'Access denied. Check whether logged in.' }
module.exports.SESSION_NOT_FOUND = { status: 'error', message: 'Session not found. Check your loging in.' }
module.exports.UNEXPECTED_FIELD_ERROR = { status: 'error', message: 'Unexpected field error. Check it has proper name' }
module.exports.CONFLICT_PARAMETER = { status: 'error', message: 'Conflict parameter.' }

module.exports.FACEBOOK_LOGIN_FAIL = { status: 'error', message: 'Facebook login fail.' }
module.exports.LOCAL_LOGIN_FAIL = { status: 'error', message: 'Local login fail.' }

module.exports.INCORRECT_USERNAME = 'Incorrect username.'
module.exports.INCORRECT_PASSWORD = 'Incorrect password.'

module.exports.ERROR = (err) => ({ status: 'error', message: err })

module.exports.SUCCESS = { status: 'success', message: '' }
module.exports.SUCCESS = (results) => ({ status: 'success', data: results })
