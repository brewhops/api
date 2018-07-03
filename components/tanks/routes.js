let router = require('express').Router()
let Controller = require('./logic')
let validator = require('./validator')
let validate = require('express-validation')
let { requireAuthentication } = require('./../../middleware/auth')

module.exports = function(tableName) {
  let controller = new Controller(tableName)

  if (process.env.NODE_ENV !== 'test') {
    controller.connectToDB()
      .then(() => console.log('Tanks route connected to database'))
      .catch(e => console.log('Error! Connection refused', e))
  }

  router.use((req, res, next) => next()) // init

  // GET
  router.get('/', controller.getTanks)
  router.get('/id/:id', controller.getTank)
  router.get('/id/:id/data', controller.getTankData)

  // POST
  router.post('/', validate(validator.createTank), controller.createTank)

  // PUT
  router.patch('/id/:id', validate(validator.updateTank), controller.updateTank)

  // DELETE
  router.delete('/id/:id', requireAuthentication, controller.deleteTank)

  router.use('*', (req, res) => res.status(400).json({
    err: `${req.originalUrl} doesn't exist`
  }))

  return router
}
