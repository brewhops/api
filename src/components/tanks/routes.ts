import { Router, Request, Response, NextFunction } from 'express';
import { TankController } from './logic';
import { TankValidator } from './validator';
import { requireAuthentication } from './../../middleware/auth';

// tslint:disable:no-any no-unsafe-any no-console no-void-expression

// tslint:disable-next-line:no-require-imports no-var-requires
const validate = require('express-validation');

// tslint:disable-next-line:no-any
export function routes(tableName: any) {
  const controller: TankController = new TankController(tableName);
  const router = Router();

  if (process.env.NODE_ENV !== 'test') {
    controller
      .connect()
      .then(() => console.log('Tanks route connected to database'))
      .catch(e => console.log('Error! Connection refused', e));
  }

  // tslint:disable-next-line: no-void-expression
  router.use((req: Request, res: Response, next: NextFunction) => next()); // init

  // GET
  router.get('/', controller.getTanks);
  router.get('/id/:id', controller.getTank);
  router.get('/monitoring', controller.getTankMonitoring);

  // POST
  router.post('/', validate(TankValidator.createTank), controller.createTank);

  // PUT
  router.patch('/id/:id', validate(TankValidator.updateTank), controller.updateTank);

  // DELETE
  router.delete('/id/:id', requireAuthentication, controller.deleteTank);

  router.use('*', (req, res) =>
    res.status(400).json({
      err: `${req.originalUrl} doesn't exist`
    })
  );

  return router;
}
