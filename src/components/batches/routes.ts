let router = require('express').Router();
let Controller = require('./logic');
let validator = require('./validator');
let validate = require('express-validation');
let boom = require('boom');

module.exports = function(tableName) {
  const controller = new Controller(tableName);

  if (process.env.NODE_ENV !== 'test') {
    controller.connectToDB()
      .then(() => console.log('Batches route connected to database'))
      .catch(e => console.log('Error! Connection refused', e));
  }

  router.use((req, res, next) => next());

  // [GET] section
  router.get('/', controller.getBatches);
  router.get('/id/:id', controller.getBatch);
  router.get('/history/id/:id', controller.getBatchHistory);

  // [POST] section
  router.post('/', validate(validator.createBatch), controller.createBatch);

  // [PATCH] section
  router.patch('/id/:id', validate(validator.updateBatch), controller.updateBatch);

  // [DELETE] section
  router.delete('/id/:id', controller.deleteBatch);

  router.use('*', (req, res) => res.status(404).json(
    boom.notFound(`The route ${req.originalUrl} does not exist`)
  ));

  return router;
};
