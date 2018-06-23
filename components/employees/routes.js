const router = require('express').Router()
const Controller = require('./logic')
const validator = require('./validator')
const validate = require('express-validation')
const { requireAuthentication } = require('./../../middleware/auth')

module.exports = function () {
  let controller = new Controller()

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

  router.use('*', (req, res) => res.json({
    err: `Oh nose, ${req.originalUrl} doesn't exist`
  }))

  return router
}
