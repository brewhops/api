require('dotenv').config()
let app = require('express')()
let bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.use(function (err, req, res, next) {
  console.log(err)
  res.status(400).json(err)
}) // error handler for validator

app.use('/employees', require('./components/employees/routes')())
app.use('/tanks', require('./components/tanks/routes')())
app.use('/actions', require('./components/actions/routes')())
app.use('/recipes', require('./components/recipes/routes')())
app.use('/batches', require('./components/batches/routes')())
