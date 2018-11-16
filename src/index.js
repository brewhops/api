require('dotenv').config()
let app = require('express')()
let bodyParser = require('body-parser')
const cors = require('cors')

if (process.env.NODE_ENV !== 'test') {
  app.listen(process.env.PORT, () => console.log(`Server running at port ${process.env.PORT}`))
}

app.use(bodyParser.json())
app.use(cors())

app.use(function(err, req, res, next) {
  console.log(err)
  res.status(400).json(err)
}) // error handler for validator

app.use('/employees', require('./components/employees/routes')('employees'))
app.use('/tanks', require('./components/tanks/routes')('tanks'))
app.use('/actions', require('./components/actions/routes')('actions'))
app.use('/recipes', require('./components/recipes/routes')('recipes'))
app.use('/batches', require('./components/batches/routes')('batches'))

module.exports = app
