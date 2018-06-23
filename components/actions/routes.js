let router = require('express').Router()
let Controller = require('./logic')
let validator = require('./validator')
let validate = require('express-validation')

module.exports = function () {
  let controller = new Controller()

  router.use((req, res, next) => next()) // init

  // [GET] section
  router.get('/', controller.getActions)
  router.get('/id/:id', controller.getAction)

  // [POST] section
  router.post('/', validate(validator.createAction), controller.createAction)

  // [PATCH] section
  router.patch('/id/:id', validate(validator.updateAction), controller.updateAction)

  // [DELETE] section
  router.delete('/id/:id', controller.deleteAction)

  router.use('*', (req, res) => res.json({
    err: `Oh nose, ${req.originalUrl} doesn't exist`
  }))

  return router
}
