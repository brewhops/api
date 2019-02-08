import { PostgresController, IPostgresController } from '../../dal/postgres';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import Boom from 'boom';
import { Task } from './types';
import { QueryResult } from 'pg';

// tslint:disable: no-unsafe-any

export interface ITaskController extends IPostgresController {
  getTasks: RequestHandler;
  createTask: RequestHandler;
  updateTask: RequestHandler;
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

  /**
   * Creates new task in the database
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof TaskController
   */
  async createTask(req: Request, res: Response, next: NextFunction) {

    const taskInfo: Task = req.body;
    taskInfo.id = undefined;

    let taskExists: QueryResult;
    try {
      await this.connect();
      taskExists = await this.client.query(
        `SELECT * FROM tasks
        WHERE completed_on IS NULL
        AND batch_id = $1`,
        [taskInfo.batch_id]
      );
      await this.disconnect();

      if (taskExists.rowCount > 0) {
        res.status(400).send(Boom.badRequest('You can only have one open task per batch.'));

        return;
      }

    } catch(err) {
      res.status(500).send(Boom.badRequest(err));
    }

    if (taskInfo.completed_on === '') {
      taskInfo.completed_on = undefined;
    }

    // dont let the user try and finish a task that has not started
    if (taskInfo.completed_on !== undefined) {
      res.status(400).send(Boom.badRequest('You can not close a task that has not yet been opened'));

      return;
    }

    // parse it out
    const { keys, values, escapes } = this.splitObjectKeyVals(taskInfo);

    // insert a new task
    try {
      await this.connect();
      const results: QueryResult = await this.createInTable(keys, this.tableName(), escapes, values);
      await this.disconnect();

      if (results.rows.length === 1) {
        res.status(201).json(results.rows[0]);
      } else {
        res.status(500).send('Failed to retrieve object after creation.');
      }
    } catch (err) {
      res.status(500).send(Boom.badRequest(err));
    }

  }

  /**
   * Updates existing task in the database
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof TaskController
   */
  async updateTask(req: Request, res: Response, next: NextFunction) {
    const taskInfo: Task = req.body;
    const taskId = taskInfo.id;
    taskInfo.id = undefined;

    if (taskId === undefined) {
      res.status(400).send(Boom.badRequest('Must include task id.'));

      return;
    }

    try {

      // parse it out
      const { keys, values } = this.splitObjectKeyVals(taskInfo);
      const { query, idx } = this.buildUpdateString(keys);
      values.push(String(taskId));

      // insert a new task
      await this.connect();
      const results: QueryResult = await this.update(query, `id = \$${idx}`, values);
      await this.disconnect();

      if (results.rowCount > 0) {
        res.status(200).json(results.rows[0]);
      } else {
        res.status(404).end();

        return;
      }

    } catch (err) {
      res.status(500).send(Boom.badRequest(err));

      return;
    }

  }
}