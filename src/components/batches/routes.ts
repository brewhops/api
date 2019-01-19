import e, { Router, Request, Response, NextFunction } from 'express';
import { BatchesController, IBatchesController } from './controller';
import { BatchesValidator } from './validator';
import Boom from 'boom';
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
  router.get('/id/:id', async (req, res, next) => controller.getBatch(req, res, next));
  router.get('/history/id/:id', async (req, res, next) => controller.getBatchHistory(req, res, next));

  // [POST] section
  router.post('/', validate(BatchesValidator.createBatch), async (req, res, next) => controller.createBatch(req, res, next));

  // [PATCH] section
  router.patch('/id/:id', validate(BatchesValidator.updateBatch), async (req, res, next) => controller.updateBatch(req, res, next));

  // [DELETE] section
  router.delete('/id/:id', async (req, res, next) => controller.deleteBatch(req, res, next));

  router.use('*', (req, res) =>
    res.send(Boom.notFound(`The route ${req.originalUrl} does not exist`))
  );

  return router;
}
