import { Pg } from './../../postgres/pg';
import {Request, Response, NextFunction} from 'express';
import is from 'is';

// tslint:disable:no-any no-unsafe-any
/**
 * Defines the logic for the 'action' route
 * @export
 * @class ActionLogic
 * @extends {Pg}
 */
export class ActionLogic extends Pg {

  constructor(tableName: string) {
    super(tableName);
  }

  // GET
  async getActions(req: Request, res: Response) {
    try {
      const { rows } = await this.read();
      res.json(rows);
    } catch(error) {
      res.status(500);
      res.send(error);
    }
  }

  async getAction(req: Request, res: Response, next: NextFunction) {
    try {
      const { rows } = await this.readById(req.params.id);
      if (rows.length > 0) {
        res.json(rows[0]);
      } else {
        next();
      }
    } catch (e) {
      res.status(500).json(e);
    }
  }

  // POST
  async createAction(req: Request, res: Response) {
    const { keys, values, escapes } = this.splitObjectKeyVals(req.body);
    const { rows } = await this.create(keys, escapes, values);
    res.status(201).json(rows[0]);
  }

  // PATCH/PUT
  async updateAction(req: Request, res: Response, next: NextFunction) {
    if (is.empty(req.body)) {
      res.status(400).json({err: 'Request does not match valid form'});
    } else {
      const { keys, values } = this.splitObjectKeyVals(req.body);
      const { query, idx } = this.buildUpdateString(keys);
      values.push(req.params.id); // add last escaped value for where clause

      try {
        const { rows } = await this.update(query, `id = \$${idx}`, values); // eslint-disable-line
        if (rows.length > 0) {
          res.json(rows[0]);
        } else {
          next();
        }
      } catch (e) {
        res.status(500).json(e);
      }
    }
  }

  // DELETE
  async deleteAction(req: Request, res: Response, next: NextFunction) {
    try {
      const response = await this.deleteById(req.params.id);
      if (response.rowCount > 0) {
        res.status(200).json();
      } else {
        next();
      }
    } catch (e) {
      res.status(500).json(e);
    }
  }
}
