import e, { Request, Response, NextFunction, Router } from 'express';
import { RecipeLogic, IRecipeLogic } from './logic';
import { RecipeValidator } from './validator';
// tslint:disable-next-line:no-var-requires no-require-imports
const validate = require('express-validation');

// tslint:disable:no-any no-unsafe-any

export async function routes(tableName: string) {
  const controller: RecipeLogic = new RecipeLogic(tableName);
  const router: Router = Router();

  if (process.env.NODE_ENV !== 'test') {
    try {
      await controller.connect();
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.error(error);
    }
  }

  // tslint:disable-next-line:no-void-expression
  router.use((req: Request, res: Response, next: NextFunction) => next()); // init

  // [GET] section
  router.get('/', controller.getRecipes);
  router.get('/id/:id', controller.getRecipe);

  // [POST] section
  router.post('/', validate(RecipeValidator.createRecipe), controller.createRecipe);

  // [PATCH] section
  router.patch('/id/:id', validate(RecipeValidator.updateRecipe), controller.updateRecipe);

  // [DELETE] section
  router.delete('/id/:id', controller.deleteRecipe);

  router.use('*', (req, res) =>
    res.status(400).json({
      err: `${req.originalUrl} doesn't exist`
    })
  );

  return router;
}
