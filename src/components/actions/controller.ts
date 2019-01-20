import { PostgresController, IPostgresController } from '../../dal/postgres';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import Boom from 'boom';
import is from 'is';

// tslint:disable: no-unsafe-any

export interface IActionController extends IPostgresController {
  getActions: RequestHandler;
  getAction: RequestHandler;
  createAction: RequestHandler;
  updateAction: RequestHandler;
  deleteAction: RequestHandler;
}

/**
 * Controller class for the 'actions' routes
 * @export
 * @class ActionController
 * @extends {PostgresController}
 * @implements {IActionController}
 */
export class ActionController extends PostgresController implements IActionController {
  constructor(tableName: string) {
    super(tableName);
  }

  /**
   * Returns an array of all available actions.
   * @param req
   * @param res
   */
  async getActions(req: Request, res: Response) {
    try {
      await this.connect();
      const { rows } = await this.read('*', '$1', [true]);
      res.status(200).json(rows);
    } catch (err) {
      res.send(Boom.badImplementation(err));
    }
    await this.disconnect();
  }

  /**
   * Returns a single action by id.
   * @param req
   * @param res
   * @param next
   */
  async getAction(req: Request, res: Response, next: NextFunction) {
    try {
      await this.connect();
      const { rows } = await this.readById(req.params.id);
      if (rows.length > 0) {
        res.status(200).json(rows[0]);
      } else {
        next();
      }
    } catch (err) {
      res.send(Boom.badImplementation(err));
    }
    await this.disconnect();
  }

  /**
   * Creates a new action.
   * @param req
   * @param res
   */
  async createAction(req: Request, res: Response) {
    const { keys, values, escapes } = this.splitObjectKeyVals(req.body);
    try {
      await this.connect();
      const { rows } = await this.create(keys, escapes, values);
      res.status(201).json(rows[0]);
    } catch (err) {
      res.send(Boom.badImplementation(err));
    }
    await this.disconnect();
  }

  /**
   * Updates an action.
   * @param req
   * @param res
   * @param next
   */
  async updateAction(req: Request, res: Response, next: NextFunction) {
    if (is.empty(req.body)) {
      res.send(Boom.badRequest('Request does not match valid form'));
    } else {
      const { keys, values } = this.splitObjectKeyVals(req.body);
      const { query, idx } = this.buildUpdateString(keys);
      values.push(req.params.id); // add last escaped value for where clause

      try {
        await this.connect();
        const { rows } = await this.update(query, `id = \$${idx}`, values); // eslint-disable-line
        if (rows.length > 0) {
          res.status(200).json(rows[0]);
        } else {
          next();
        }
      } catch (err) {
        res.send(Boom.badImplementation(err));
      }
      await this.disconnect();
    }
  }

  /**
   * Deletes an action.
   * @param req
   * @param res
   * @param next
   */
  async deleteAction(req: Request, res: Response, next: NextFunction) {
    const {id} = req.params;
    try {
      await this.connect();
      const response = await this.deleteById(id);
      if (response.rowCount > 0) {
        res.status(200).json(`Successfully deleted action (id=${id}).`);
      } else {
        next();
      }
    } catch (err) {
      res.send(Boom.badImplementation(err));
    }
    await this.disconnect();
  }
}
