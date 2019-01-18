import { Router, Request, Response, NextFunction } from 'express';
import { TankController } from './controller';
import { TankValidator } from './validator';
import { requireAuthentication } from './../../middleware/auth';

// tslint:disable:no-any no-unsafe-any no-console no-void-expression

// tslint:disable-next-line:no-require-imports no-var-requires
const validate = require('express-validation');

// tslint:disable-next-line:no-any
export function routes() {
  const controller: TankController = new TankController('tanks');
  const router = Router();

  // tslint:disable-next-line: no-void-expression
  router.use((req: Request, res: Response, next: NextFunction) => next()); // init

  // GET
  router.get('/', async (req, res) => controller.getTanks(req, res));
  router.get('/id/:id', async (req, res, next) => controller.getTank(req, res, next));
  router.get('/monitoring', async (req, res, next) => controller.getTankMonitoring(req, res, next));

  // POST
  router.post('/', validate(TankValidator.createTank), async (req, res) => controller.createTank(req, res));

  // PUT
  router.patch('/id/:id', validate(TankValidator.updateTank), async (req, res, next) => controller.updateTank(req, res, next));

  // DELETE
  router.delete('/id/:id', requireAuthentication, async (req, res, next) => controller.deleteTank(req, res, next));

  router.use('*', (req, res) =>
    res.status(400).json({
      err: `${req.originalUrl} doesn't exist`
    })
  );

  return router;
}
