import { Request, Response, NextFunction, Router } from 'express';
import { ActionController, IActionController } from './controller';
import Boom from 'boom';
import { ActionValidator } from './validator';
import { requireAuthentication } from '../../middleware/auth';
// tslint:disable-next-line:no-var-requires no-require-imports
const validate = require('express-validation');

// tslint:disable: no-unsafe-any

/**
 * Initializes the 'actions' route handlers and returns an Express.Router
 * @export
 * @returns {Router}
 */
export function routes(): Router {
  const controller: IActionController = new ActionController('actions');
  const router: Router = Router();

  // tslint:disable-next-line: no-void-expression
  router.use((req: Request, res: Response, next: NextFunction) => next()); // init

  // [GET] section
  router.get('/', async (req, res, next) => controller.getActions(req, res, next));
  router.get('/id/:id', async (req, res, next) => controller.getAction(req, res, next));

  // [POST] section
  router.post('/', validate(ActionValidator.createAction), requireAuthentication, async (req, res, next) => controller.createAction(req, res, next));

  // [PATCH] section
  router.patch('/id/:id', validate(ActionValidator.updateAction), requireAuthentication, async (req, res, next) => controller.updateAction(req, res, next));

  // [DELETE] section
  router.delete('/id/:id', requireAuthentication, async (req, res, next) => controller.deleteAction(req, res, next));

  router.use('*', (req: Request, res: Response) => res.status(400).send(Boom.badRequest(`${req.originalUrl} doesn't exist`)));

  return router;
}
