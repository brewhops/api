import { PostgresController, IPostgresController } from '../../dal/postgres';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import is from 'is';
import Boom from 'boom';

// tslint:disable:no-any no-unsafe-any
export interface ITankController extends IPostgresController {
  getTanks: RequestHandler;
  getTank: RequestHandler;
  getTankMonitoring: RequestHandler;
  createTank: RequestHandler;
  updateTank: RequestHandler;
  deleteTank: RequestHandler;
}

/**
 * Controller class for the tanks route
 * @export
 * @class TankController
 * @extends {PostgresController}
 * @implements {ITankController}
 */
export class TankController extends PostgresController implements ITankController {
  constructor(tableName: any) {
    super(tableName);
  }

  /**
   * Returns an array of tanks
   * @param {Request} req
   * @param {Response} res
   * @memberof TankController
   */
  async getTanks(req: Request, res: Response) {
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
   * Returns a single tank by id
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof TankController
   */
  async getTank(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      await this.connect();
      // get the tank by that ID
      const { rows } = await this.readById(id);
      // if it returns at least one tank
      if (rows.length > 0) {
        // return that tank
        res.status(200).json(rows[0]);
      } else {
        // let the user know that tank does not exist
        next();
      }
    } catch (err) {
      res.status(400).send(Boom.badRequest(err));
    }
    await this.disconnect();
  }

  /**
   * Returns the last measurment and action for a tank by id
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof TankController
   */
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
      await this.connect();
      const results = await this.client.query(query);
      res.status(200).json(results.rows);
    } catch (err) {
      res.status(500).send(Boom.badImplementation(err));
    }
    await this.disconnect();
  }

  /**
   * Creates a new tank
   * @param {Request} req
   * @param {Response} res
   * @memberof TankController
   */
  async createTank(req: Request, res: Response) {
    const { keys, values, escapes } = this.splitObjectKeyVals(req.body);
    try {
      await this.connect();
      const { rows } = await this.create(keys, escapes, values);
      res.status(201).json(rows[0]);
    } catch (err) {
      res.status(400).send(Boom.badRequest(err));
    }
    await this.disconnect();
  }

  /**
   * Updates a tank
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof TankController
   */
  async updateTank(req: Request, res: Response, next: NextFunction) {
    const {id} = req.params;
    if (is.empty(req.body)) {
      res.status(400).send(Boom.badRequest('Request does not match valid form'));
    } else {
      const { keys, values } = this.splitObjectKeyVals(req.body);
      const { query, idx } = this.buildUpdateString(keys);
      values.push(id); // add last escaped value for where clause
      try {
        await this.connect();
        const { rows } = await this.update(query, `id = $${idx}`, values); // eslint-disable-line
        if (rows.length > 0) {
          res.status(200).json(rows);
        } else {
          next();
        }
      } catch (err) {
        res.status(500).send(Boom.badImplementation(err));
      }
      await this.disconnect();
    }
  }

  /**
   * Deletes a tank
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof TankController
   */
  async deleteTank(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      await this.connect();
      const { rowCount } = await this.deleteById(id);
      if (rowCount > 0) {
        res.status(200).json(`Successfully deleted tank (id=${id})`);
      } else {
        next();
      }
    } catch (err) {
      res.status(500).send(Boom.badImplementation(err));
    }
    await this.disconnect();
  }
}
