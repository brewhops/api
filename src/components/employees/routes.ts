import { Router, Request, Response, NextFunction } from 'express';
import { UserValidator } from './validator';
import { UserLogic } from './logic';
import { requireAuthentication } from './../../middleware/auth';

// tslint:disable:no-any no-unsafe-any

// tslint:disable-next-line:no-var-requires no-require-imports
const validate = require('express-validation');

export async function routes(tableName: string) {
  const controller = new UserLogic(tableName);
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
  router.use((req: Request, res: Response, next: NextFunction) => next()); // init

  // [GET] section
  router.get('/', controller.getUsers);
  router.get('/id/:id', requireAuthentication, controller.getUser);

  // [POST] section
  router.post('/', validate(UserValidator.createUser), controller.createUser);
  router.post('/login', validate(UserValidator.login), controller.login);

  // [PATCH] section
  router.patch(
    '/id/:id',
    validate(UserValidator.updateUser), requireAuthentication,
    controller.updateUser
  );

  // [DELETE] section
  router.delete(
    '/id/:id',
    requireAuthentication,
    controller.deleteUser
  );

  router.use('*', (req, res) => res.status(400).json({
    err: `${req.originalUrl} doesn't exist`
  }));

  return router;
}
