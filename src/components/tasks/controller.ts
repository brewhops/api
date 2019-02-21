import { PostgresController, IPostgresController } from '../../dal/postgres';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import Boom from 'boom';
import { Task } from './types';
import { QueryResult, Client } from 'pg';

// tslint:disable: no-unsafe-any

export interface ITaskController extends IPostgresController {
  getTasks: RequestHandler;
  getTasksByBatch: RequestHandler;
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
   * Returns tasks for a batch
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof TaskController
   */
  async getTasksByBatch(req: Request, res: Response, next: NextFunction) {
    let client;
    try {
      client = await this.connect(true) as Client;
      const { rows } = await this.read('*', 'batch_id = $1', [req.params.batchId], client);

      res.status(200).json(rows);
    } catch (err) {
      res.status(500).send(Boom.badImplementation(err));
    } finally {
      await this.disconnect(client);
    }
  }

  /**
   * Creates new task in the database
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof TaskController
   */
  async createTask(req: Request, res: Response, next: NextFunction) {
    const { id, ...taskInfo } = req.body;

    let client;
    try {
      client = await this.connect(true) as Client;

      const taskExists = await client.query(
        `SELECT * FROM tasks
        WHERE completed_on IS NULL
        AND batch_id = $1`,
        [taskInfo.batch_id]
      );

      if (taskExists.rowCount === 0) {
        // dont let the user try and finish a task that has not started
        if (!taskInfo.completed_on) {

          // parse it out
          const { keys, values, escapes } = this.splitObjectKeyVals(taskInfo);

          const results: QueryResult = await this.createInTable(keys, this.tableName(), escapes, values, client);

          if (results.rows.length === 1) {
            res.status(201).json(results.rows[0]);
          } else {
            res.status(500).send('Failed to retrieve object after creation.');
          }

        } else {
          res.status(400).send(Boom.badRequest('You can not close a task that has not yet been opened'));
        }

      } else {
        res.status(400).send(Boom.badRequest('You can only have one open task per batch.'));
      }

    } catch(err) {
      res.status(500).send(Boom.badRequest(err));
    } finally {
      await this.disconnect(client);
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
    const { id, ...taskInfo } = req.body;

    let client;
    try {

      if (id !== undefined) {
        client = await this.connect(true) as Client;

        // parse it out
        const { keys, values } = this.splitObjectKeyVals(taskInfo);
        const { query, idx } = this.buildUpdateString(keys);
        values.push(id);

        // insert a new task
        const results: QueryResult = await this.update(query, `id = \$${idx}`, values, client);

        if (results.rowCount > 0) {
          res.status(200).json(results.rows[0]);
        } else {
          res.status(404).end();
        }

      } else {
        res.status(400).send(Boom.badRequest('Must include task id.'));
      }

    } catch (err) {
      res.status(500).send(Boom.badRequest(err));
    } finally {
      await this.disconnect(client);
    }

  }
}