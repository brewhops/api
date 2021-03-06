  import Boom from "boom";
  import { NextFunction, Request, RequestHandler, Response } from "express";
  import is from "is";
  import { IPostgresController, PostgresController } from "../../dal/postgres";

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
  public async getActions(req: Request, res: Response) {
    try {
      const { rows } = await this.read("*", "$1", [true]);
      res.status(200).json(rows);
    } catch (err) {
      res.status(500).send(Boom.badImplementation(err));
    }
  }

  /**
   * Returns a single action by id.
   * @param req
   * @param res
   * @param next
   */
  public async getAction(req: Request, res: Response, next: NextFunction) {
    try {
      const { rows } = await this.readById(req.params.id);
      if (rows.length > 0) {
        res.status(200).json(rows[0]);
      } else {
        next();
      }
    } catch (err) {
      res.status(500).send(Boom.badImplementation(err));
    }
  }

  /**
   * Creates a new action.
   * @param req
   * @param res
   */
  public async createAction(req: Request, res: Response) {
    const { keys, values, escapes } = this.splitObjectKeyVals(req.body);
    try {
      const { rows } = await this.create(keys, escapes, values);
      res.status(201).json(rows[0]);
    } catch (err) {
      res.status(500).send(Boom.badImplementation(err));
    }
  }

  /**
   * Updates an action.
   * @param req
   * @param res
   * @param next
   */
  public async updateAction(req: Request, res: Response, next: NextFunction) {
    if (is.empty(req.body)) {
      res.status(400).send(Boom.badRequest("Request does not match valid form"));
    } else {
      const { keys, values } = this.splitObjectKeyVals(req.body);
      const { query, idx } = this.buildUpdateString(keys);
      values.push(req.params.id); // add last escaped value for where clause

      try {
        const { rows } = await this.update(query, `id = \$${idx}`, values); // eslint-disable-line
        if (rows.length > 0) {
          res.status(200).json(rows[0]);
        } else {
          next();
        }
      } catch (err) {
        res.status(500).send(Boom.badImplementation(err));
      }
    }
  }

  /**
   * Deletes an action.
   * @param req
   * @param res
   * @param next
   */
  public async deleteAction(req: Request, res: Response, next: NextFunction) {
    const {id} = req.params;
    try {
      const response = await this.deleteById(id);
      if (response.rowCount > 0) {
        res.status(200).json(`Successfully deleted action (id=${id}).`);
      } else {
        next();
      }
    } catch (err) {
      res.status(500).send(Boom.badImplementation(err));
    }
  }
}
