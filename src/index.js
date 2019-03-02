const express = require('express')
const app = express()
const router = express.Router()

const config = require('./config')
const helmet = require('helmet')
const bodyParser = require('body-parser')
const flash = require('connect-flash')
// @session
require('./config/session')(app)
// @passport
require('./config/passport')(app)
// @development
require('./config/development')(app)
// @production
require('./config/production')(app)
app.use(flash())
app.use(helmet())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({
  extended: false,
  limit: '100mb'
}))
app.use(bodyParser.json())

app.use('/api', require('./routes')(router))

app.listen(config.PORT, () => {
  console.log(`listening port: " ${config.PORT}...`)
})
