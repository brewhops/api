import e, {Router, Request, Response, NextFunction} from 'express';
import { BatchesLogic } from './logic';
import {BatchesValidator} from './validator';
import Boom from 'boom';
// tslint:disable-next-line:no-var-requires no-require-imports
const validate = require('express-validation');


// tslint:disable:no-any no-unsafe-any

export async function routes(tableName: string) {
  const controller = new BatchesLogic(tableName);
  const router = Router();

  if (process.env.NODE_ENV !== 'test') {
    try {
      await controller.connect();
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.error(error);
    }
  }

  // tslint:disable-next-line:no-void-expression
  router.use((req: Request, res: Response, next: NextFunction) => next());

  // [GET] section
  router.get('/', controller.getBatches);
  router.get('/id/:id', controller.getBatch);
  router.get('/history/id/:id', controller.getBatchHistory);

  // [POST] section
  router.post('/', validate(BatchesValidator.createBatch), controller.createBatch);

  // [PATCH] section
  router.patch('/id/:id', validate(BatchesValidator.updateBatch), controller.updateBatch);

  // [DELETE] section
  router.delete('/id/:id', controller.deleteBatch);

  router.use('*', (req, res) => res.status(404).json(
    Boom.notFound(`The route ${req.originalUrl} does not exist`)
  ));

  return router;
}
