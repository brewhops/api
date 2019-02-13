import { Request, Response, NextFunction, Router } from 'express';
import { TaskController, ITaskController } from './controller';
import Boom from 'boom';

// tslint:disable: no-unsafe-any

/**
 * Initializes the 'tasks' route handlers and returns an Express.Router
 * @export
 * @returns {Router}
 */
export function routes(): Router {
  const controller: ITaskController = new TaskController('tasks');
  const router: Router = Router();

  // tslint:disable-next-line: no-void-expression
  router.use((req: Request, res: Response, next: NextFunction) => next()); // init

  // [GET] section
  router.get('/', async (req, res, next) => controller.getTasks(req, res, next));
  router.get('/batch/:batchId', async (req, res, next) => controller.getTasksByBatch(req, res, next));

  // [POST] section
  router.post('/', async (req, res, next) => controller.createTask(req, res, next));

  // [PATCH] section
  router.patch('/', async (req, res, next) => controller.updateTask(req, res, next));

  router.use('*', (req: Request, res: Response) => res.status(400).send(Boom.badRequest(`${req.originalUrl} doesn't exist`)));

  return router;
}