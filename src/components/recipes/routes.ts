let router = require('express').Router();
let Controller = require('./logic');
let validator = require('./validator');
let validate = require('express-validation');

module.exports = function(tableName) {
  const controller = new Controller(tableName);

  if (process.env.NODE_ENV !== 'test') {
    controller.connectToDB()
      .then(() => console.log('Recipes route connected to database'))
      .catch(e => console.log('Error! Connection refused', e));
  }

  router.use((req, res, next) => next()); // init

  // [GET] section
  router.get('/', controller.getRecipes);
  router.get('/id/:id', controller.getRecipe);

  // [POST] section
  router.post('/', validate(validator.createRecipe), controller.createRecipe);

  // [PATCH] section
  router.patch('/id/:id', validate(validator.updateRecipe), controller.updateRecipe);

  // [DELETE] section
  router.delete('/id/:id', controller.deleteRecipe);

  router.use('*', (req, res) => res.status(400).json({
    err: `${req.originalUrl} doesn't exist`
  }));

  return router;
};
