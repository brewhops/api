import { PostgresController, IPostgresController } from '../../dal/postgres';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import Boom from 'boom';

// tslint:disable: no-unsafe-any

export interface ITaskController extends IPostgresController {
  getTasks: RequestHandler;
}

/**
 * Controller for the tasks route
 * @export
 * @class TaskController
 * @extends {PostgresController}
 * @implements {ITaskController}
 */
export class TaskController extends PostgresController implements ITaskController {

  constructor(tableName: string) {
    super(tableName);
  }

  /**
   * Returns all tasks in the database
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof TaskController
   */
  async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      await this.connect();
      const { rows } = await this.read('*', '$1', [true]);
      res.status(200).json(rows);
    } catch (err) {
      res.status(500).send(Boom.badImplementation(err));
    }
    await this.disconnect();
  }

}