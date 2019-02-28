module.exports = (app) => {
  if (app.get('env') === 'production') {
    const compression = require('compression')

    console.log('Applicatoin Name: Production')
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`)
    console.log(`app: ${app.get('env')}`)

    app.use(compression())
  }
}
