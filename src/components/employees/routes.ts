import { Router, Request, Response, NextFunction } from 'express';
import { EmployeeValidator } from './validator';
import { EmployeeController, IEmployeeController } from './controller';
import { requireAuthentication } from './../../middleware/auth';
import Boom from 'boom';

// tslint:disable:no-any no-unsafe-any

// tslint:disable-next-line:no-var-requires no-require-imports
const validate = require('express-validation');

export function routes(): Router {
  const controller: IEmployeeController = new EmployeeController('employees');
  const router: Router = Router();

  // tslint:disable-next-line:no-void-expression
  router.use((req: Request, res: Response, next: NextFunction) => next()); // init

  // [GET] section
  router.get('/', async (req, res, next) => controller.getEmployees(req, res, next));
  router.get('/admin/:username', async (req, res, next) => controller.verifyAdmin(req, res, next));
  router.get('/id/:id', requireAuthentication, async (req, res, next) => controller.getEmployee(req, res, next));

  // [POST] section
  router.post('/', validate(EmployeeValidator.createEmployee), requireAuthentication, async (req, res, next) => controller.createEmployee(req, res, next));
  router.post('/login', validate(EmployeeValidator.login), async (req, res, next) => controller.login(req, res, next));

  // [PATCH] section
  router.patch(
    '/id/:id',
    validate(EmployeeValidator.updateEmployee),
    requireAuthentication,
    async (req, res, next) => controller.updateEmployee(req, res, next)
  );

  // [DELETE] section
  router.delete('/id/:id', requireAuthentication, async (req, res, next) => controller.deleteEmployee(req, res, next));

  router.use('*', (req, res) => res.status(400).send(Boom.badRequest(`${req.originalUrl} doesn't exist`)));

  return router;
}
