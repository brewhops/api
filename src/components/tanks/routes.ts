import { Router, Request, Response, NextFunction } from 'express';
import { TankController, ITankController } from './controller';
import { TankValidator } from './validator';
import { requireAuthentication } from './../../middleware/auth';
import Boom from 'boom';

// tslint:disable:no-any no-unsafe-any no-console no-void-expression

// tslint:disable-next-line:no-require-imports no-var-requires
const validate = require('express-validation');

// tslint:disable-next-line:no-any
export function routes(): Router {
  const controller: ITankController = new TankController('tanks');
  const router = Router();

  // tslint:disable-next-line: no-void-expression
  router.use((req: Request, res: Response, next: NextFunction) => next()); // init

  // GET
  router.get('/', async (req, res, next) => controller.getTanks(req, res, next));
  router.get('/id/:id', async (req, res, next) => controller.getTank(req, res, next));
  router.get('/monitoring', async (req, res, next) => controller.getTankMonitoring(req, res, next));

  // POST
  router.post('/', validate(TankValidator.createTank), requireAuthentication, async (req, res, next) => controller.createTank(req, res, next));

  // PUT
  router.patch('/id/:id', validate(TankValidator.updateTank), requireAuthentication, async (req, res, next) => controller.updateTank(req, res, next));

  // DELETE
  router.delete('/id/:id', requireAuthentication, async (req, res, next) => controller.deleteTank(req, res, next));

  router.use('*', (req, res) => res.send(Boom.badRequest(`${req.originalUrl} doesn't exist`)));

  return router;
}
