let router = require('express').Router();
let Controller = require('./logic');
let validator = require('./validator');
let validate = require('express-validation');

module.exports = function(tableName) {
  const controller = new Controller(tableName);

  // we want to connect to the DB automatically if we are not testing
  if (process.env.NODE_ENV !== 'test') {
    controller.connectToDB()
      .then(() => console.log('Actions route connected to database'))
      .catch(e => console.log('Error! Connection refused', e));
  }

  router.use((req, res, next) => next()); // init

  // [GET] section
  router.get('/', controller.getActions);
  router.get('/id/:id', controller.getAction);

  // [POST] section
  router.post('/', validate(validator.createAction), controller.createAction);

  // [PATCH] section
  router.patch('/id/:id', validate(validator.updateAction), controller.updateAction);

  // [DELETE] section
  router.delete('/id/:id', controller.deleteAction);

  router.use('*', (req, res) => res.status(400).json({
    err: `${req.originalUrl} doesn't exist`
  }));

  return router;
};
