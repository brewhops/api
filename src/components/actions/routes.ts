import e, { Request, Response, NextFunction, Router } from 'express';
import { ActionController } from './controller';
import { ActionValidator } from './validator';
// tslint:disable-next-line:no-var-requires no-require-imports
const validate = require('express-validation');

// tslint:disable:no-any no-unsafe-any

export function routes() {
  const controller = new ActionController('actions');
  const router = Router();

  // tslint:disable-next-line:no-void-expression
  router.use((req: Request, res: Response, next: NextFunction) => next()); // init

  // [GET] section
  router.get('/', async (req, res) => controller.getActions(req, res));
  router.get('/id/:id', async (req, res, next) => controller.getAction(req, res, next));

  // [POST] section
  router.post('/', validate(ActionValidator.createAction), async (req, res) => controller.createAction(req, res));

  // [PATCH] section
  router.patch('/id/:id', validate(ActionValidator.updateAction), async (req, res, next) => controller.updateAction(req, res, next));

  // [DELETE] section
  router.delete('/id/:id', async (req, res, next) => controller.deleteAction(req, res, next));

  router.use('*', (req: Request, res: Response) => {
    res.status(400);
    res.json({
      err: `${req.originalUrl} doesn't exist`
    });
  });

  return router;
}
