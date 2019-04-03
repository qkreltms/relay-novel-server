
module.exports.INVALID_QUERY_PARAMETER = { status: 'error', message: 'Invalid query parameter.' }
module.exports.INVALID_POST_REQUEST = { status: 'error', message: 'Invaild post request. Check your data exist or have proper types.' }

module.exports.ACCESS_DENIED = { status: 'error', message: 'Access denied. Check whether logged in.' }
module.exports.SESSION_NOT_FOUND = { status: 'error', message: 'Session not found. Check you are loging in.' }
module.exports.UNEXPECTED_FIELD_ERROR = { status: 'error', message: 'Unexpected field error. Check it has proper name.' }
module.exports.CONFLICT_PARAMETER = { status: 'error', message: 'Conflict parameter.' }

module.exports.FACEBOOK_LOGIN_FAIL = { status: 'error', message: 'Facebook login failed.' }
module.exports.LOCAL_LOGIN_FAIL = { status: 'error', message: 'Local login fail.' }

module.exports.USER_IS_ALREADY_EXISTS = { status: 'info', message: 'User is already exists. Check your email or nickname' }

module.exports.INCORRECT_USERNAME = 'Incorrect username.'
module.exports.INCORRECT_PASSWORD = 'Incorrect password.'
module.exports.DELETED_USER = 'Deleted user.'

module.exports.NOT_ADMIN = { status: 'warn', message: 'Not admin.' }

module.exports.NOTHING_TO_DELETE = 'Nothing to delete. Item is not exists.'

module.exports.ERROR = (err) => ({ status: 'error', message: err })

module.exports.SUCCESS = (message = '') => ({ status: 'success', message })

module.exports.EMAIL_OR_NICKNAME_IS_ALREADY_EXISTS = 'email or nickname is already exists.'
