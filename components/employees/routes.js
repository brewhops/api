const router = require('express').Router()
const Controller = require('./logic')
const validator = require('./validator')
const validate = require('express-validation')
const { requireAuthentication } = require('./../../middleware/auth')

module.exports = function(tableName) {
  let controller = new Controller(tableName)

  if (process.env.NODE_ENV !== 'test') {
    controller.connectToDB()
      .then(() => console.log('Employees route connected to database'))
      .catch(e => console.log('Error! Connection refused', e))
  }

  router.use((req, res, next) => next()) // init

  // [GET] section
  router.get('/', controller.getUsers)
  router.get('/id/:id', requireAuthentication, controller.getUser)

  // [POST] section
  router.post('/', validate(validator.createUser), controller.createUser)
  router.post('/login', validate(validator.login), controller.login)

  // [PATCH] section
  router.patch(
    '/id/:id',
    validate(validator.updateUser), requireAuthentication,
    controller.updateUser
  )

  // [DELETE] section
  router.delete(
    '/id/:id',
    requireAuthentication,
    controller.deleteUser
  )

  router.use('*', (req, res) => res.status(400).json({
    err: `${req.originalUrl} doesn't exist`
  }))

  return router
}
