import e, { Request, Response, NextFunction, Router } from 'express';
import { RecipeController, IRecipeController } from './controller';
import { RecipeValidator } from './validator';
import Boom from 'boom';
// tslint:disable-next-line:no-var-requires no-require-imports
const validate = require('express-validation');

// tslint:disable:no-any no-unsafe-any

export function routes(): Router {
  const controller: IRecipeController = new RecipeController('recipes');
  const router: Router = Router();

  // tslint:disable-next-line:no-void-expression
  router.use((req: Request, res: Response, next: NextFunction) => next()); // init

  // [GET] section
  router.get('/', async (req, res, next) => controller.getRecipes(req, res, next));
  router.get('/id/:id', async (req, res, next) => controller.getRecipe(req, res, next));

  // [POST] section
  router.post('/', validate(RecipeValidator.createRecipe), async (req, res, next) => controller.createRecipe(req, res, next));

  // [PATCH] section
  router.patch('/id/:id', validate(RecipeValidator.updateRecipe), async (req, res, next) => controller.updateRecipe(req, res, next));

  // [DELETE] section
  router.delete('/id/:id', async (req, res, next) => controller.deleteRecipe(req, res, next));

  router.use('*', (req, res) => res.json(Boom.badRequest(`${req.originalUrl} doesn't exist`)));

  return router;
}
