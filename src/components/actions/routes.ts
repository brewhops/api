import e, { Request, Response, NextFunction, Router } from 'express';
import { ActionController } from './logic';
import { ActionValidator } from './validator';
// tslint:disable-next-line:no-var-requires no-require-imports
const validate = require('express-validation');

// tslint:disable:no-any no-unsafe-any

export function routes(tableName: string) {
  const controller = new ActionController(tableName);
  const router = Router();

  // tslint:disable-next-line:no-void-expression
  router.use((req: Request, res: Response, next: NextFunction) => next()); // init

  // [GET] section
  router.get('/', controller.getActions);
  router.get('/id/:id', controller.getAction);

  // [POST] section
  router.post('/', validate(ActionValidator.createAction), controller.createAction);

  // [PATCH] section
  router.patch('/id/:id', validate(ActionValidator.updateAction), controller.updateAction);

  // [DELETE] section
  router.delete('/id/:id', controller.deleteAction);

  router.use('*', (req: Request, res: Response) => {
    res.status(400);
    res.json({
      err: `${req.originalUrl} doesn't exist`
    });
  });

  return router;
}
