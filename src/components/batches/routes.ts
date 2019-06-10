import e, { Router, Request, Response, NextFunction } from 'express';
import { BatchesController, IBatchesController } from './controller';
import { BatchesValidator } from './validator';
import Boom from 'boom';
import { requireAuthentication } from '../../middleware/auth';
// tslint:disable-next-line:no-var-requires no-require-imports
const validate = require('express-validation');

// tslint:disable:no-any no-unsafe-any

export function routes(): Router {
  const controller: IBatchesController = new BatchesController('batches');
  const router: Router = Router();

  // tslint:disable-next-line:no-void-expression
  router.use((req: Request, res: Response, next: NextFunction) => next());

  // [GET] section
  router.get('/', async (req, res, next) => controller.getBatches(req, res, next));
  router.get('/tank/:tankId', async (req, res, next) => controller.getBatchesByTank(req, res, next));
  router.get('/recipe/:recipeId', async (req, res, next) => controller.getBatchesByRecipe(req, res, next));
  router.get('/id/:id', async (req, res, next) => controller.getBatch(req, res, next));

  // [POST] section
  router.post('/new', validate(BatchesValidator.createBatch), requireAuthentication, async (req, res, next) => controller.createBatch(req, res, next));
  router.post('/update', validate(BatchesValidator.updateBatch), requireAuthentication, async (req, res, next) => controller.updateBatch(req, res, next));

  // [PATCH] section
  router.patch('/id/:id', requireAuthentication, async (req, res, next) => controller.patchBatch(req, res, next));

  // [DELETE] section
  router.delete('/id/:id', requireAuthentication, async (req, res, next) => controller.deleteBatch(req, res, next));
  router.delete('/close/:id', requireAuthentication, async (req, res, next) => controller.closeBatch(req, res, next));

  router.use('*', (req, res) =>
    res.status(404).send(Boom.notFound(`The route ${req.originalUrl} does not exist`))
  );

  return router;
}
