import { Pg } from './../../postgres/pg';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import is from 'is';
import { RequestHandlerParams } from 'express-serve-static-core';
import { ICrud } from '../../postgres/CRUD';
import { IdParams } from '../../routes/index';

// tslint:disable:no-any no-unsafe-any
export interface ITankController extends ICrud {
  getTanks: RequestHandler;
  getTank: RequestHandler;
  getTankMonitoring: RequestHandler;
  createTank: RequestHandler;
  updateTank: RequestHandler;
  deleteTank: RequestHandlerParams;
}

/**
 * Logic for tanks
 * @export
 * @class tankLogic
 * @extends {postgres}
 */
export class TankController extends Pg implements ITankController {
  constructor(tableName: any) {
    super(tableName);

  }

  // GET
  async getTanks(req: Request, res: Response) {
    try {
      const { rows } = await this.read();
      res.json(rows);
    } catch (e) {
      // tslint:disable-next-line:no-console
      console.log(e);
      res.status(500).json(e);
    }
  }

  async getTank(req: Request, res: Response, next: NextFunction) {
    try {
      // get the tank by that ID
      const { rows } = await this.readById(req.params.id);
      // if it returns at least one tank
      if (rows.length > 0) {
        // return that tank
        res.json(rows[0]);
      } else {
        // let the user know that tank does not exist
        next();
      }
    } catch (e) {
      res.status(400).json(e);
    }
  }

  async getTankMonitoring(req: Request, res: Response, next: NextFunction) {
    /* get most recent:
       * tank number
       * pressure
       * beer ID
       * batch number
       * action
       * temperature
    */
    const query = `
    SELECT action_name, open_tasks.batch_id, batch_name,
    tank_name, tank_id, beer_name, pressure, temperature
    FROM (
      (
        most_recent_batch_info RIGHT JOIN
        open_tasks
        ON open_tasks.batch_id = most_recent_batch_info.batch_id
      )
      RIGHT JOIN tank_open_batch
      ON open_tasks.batch_id = tank_open_batch.batch_id
    )`;
    try {
      const results = await this.client.query(query);
      res.status(200).json(results.rows);
    } catch (e) {
      res.status(500).json(e);
    }
  }

  // POST
  async createTank(req: Request, res: Response) {
    const { keys, values, escapes } = this.splitObjectKeyVals(req.body);
    try {
      const { rows } = await this.create(keys, escapes, values);
      res.status(201).json(rows[0]);
    } catch (e) {
      res.status(400).json(e);
    }
  }

  // PUT/PATCH
  async updateTank(req: Request, res: Response, next: NextFunction) {
    if (is.empty(req.body)) {
      res.status(400).json({err: 'Request does not match valid form'});
    } else {
      const { keys, values } = this.splitObjectKeyVals(req.body);
      const { query, idx } = this.buildUpdateString(keys);
      values.push(req.params.id); // add last escaped value for where clause

      const { rows } = await this.update(query, `id = \$${idx}`, values); // eslint-disable-line
      if (rows.length > 0) {
        res.json(rows);
      } else {
        next();
      }
    }
  }

  // DELETE
  async deleteTank(req: Request, res: Response, next: NextFunction) {
    try {
      const { rows } = await this.deleteById(req.params.id);
      if (rows.length > 0) {
        res.status(200).json(rows);
      } else {
        next();
      }
    } catch (e) {
      res.status(500).json(e);
    }
  }

}
