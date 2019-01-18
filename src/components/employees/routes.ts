import { Router, Request, Response, NextFunction } from 'express';
import { UserValidator } from './validator';
import { EmployeeController } from './controller';
import { requireAuthentication } from './../../middleware/auth';

// tslint:disable:no-any no-unsafe-any

// tslint:disable-next-line:no-var-requires no-require-imports
const validate = require('express-validation');

export function routes() {
  const controller: EmployeeController = new EmployeeController('employees');
  const router: Router = Router();

  // tslint:disable-next-line:no-void-expression
  router.use((req: Request, res: Response, next: NextFunction) => next()); // init

  // [GET] section
  router.get('/', async (req, res) => controller.getUsers(req, res));
  router.get('/id/:id', requireAuthentication, async (req, res) => controller.getUser(req, res));

  // [POST] section
  router.post('/', validate(UserValidator.createUser), async (req, res) => controller.createUser(req, res));
  router.post('/login', validate(UserValidator.login), async (req, res) => controller.login(req, res));

  // [PATCH] section
  router.patch(
    '/id/:id',
    validate(UserValidator.updateUser),
    requireAuthentication,
    async (req, res) => controller.updateUser(req, res)
  );

  // [DELETE] section
  router.delete('/id/:id', requireAuthentication, async (req, res) => controller.deleteUser(req, res));

  router.use('*', (req, res) =>
    res.status(400).json({
      err: `${req.originalUrl} doesn't exist`
    })
  );

  return router;
}
