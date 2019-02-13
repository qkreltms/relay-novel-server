const init = require('./config')
const express = require('express')
const app = express()
const helmet = require('helmet')
const bodyParser = require('body-parser')

app.use(helmet())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({
    extended: false,
    limit: '100mb'
}))
app.use(bodyParser.json())

// app.use('/api', routes)

app.listen(init.port, () => {
    console.log(`listening port: " ${init.port}...`)
})