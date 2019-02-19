import { PostgresController, IPostgresController } from '../../dal/postgres';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import Boom from 'boom';
import { Batch, Version } from './types';

export interface IBatchesController extends IPostgresController {
  getBatches: RequestHandler;
  getBatchesByTank: RequestHandler;
  getBatch: RequestHandler;
  createBatch: RequestHandler;
  updateBatch: RequestHandler;
  deleteBatch: RequestHandler;
  closeBatch: RequestHandler;
}

// tslint:disable:no-any no-unsafe-any no-console
/**
 * Controller class for the 'batches' route
 * @export
 * @class BatchesController
 * @extends {PostgresController}
 * @implements {IBatchesController}
 */
export class BatchesController extends PostgresController implements IBatchesController {
  constructor(tableName: string) {
    super(tableName);
  }

  /**
   * Returns an array of all batches.
   * @param {Request} req
   * @param {Response} res
   * @memberof BatchesController
   */
  async getBatches(req: Request, res: Response) {
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
   * Returns all versions from the cooresponding batch
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof TaskController
   */
  async getBatchesByTank(req: Request, res: Response, next: NextFunction) {
    try {
      await this.connect();
      const { rows } = await this.read('*', 'tank_id = $1', [req.params.tankId]);
      res.status(200).json(rows);
    } catch (err) {
      res.status(500).send(Boom.badImplementation(err));
    }
    await this.disconnect();
  }

  /**
   * Returns a single batch by id.
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof BatchesController
   */
  async getBatch(req: Request, res: Response, next: NextFunction) {
    try {
      await this.connect();
      const results = await this.readById(req.params.id);
      if (results.rowCount > 0) {
        res.status(200).json(results.rows[0]);
      } else {
        next();
      }
    } catch (err) {
      res.status(500).send(Boom.badImplementation(err));
    }
    await this.disconnect();
  }

  // tslint:disable:max-func-body-length
  /**
   * Creates a new batch, task and version.
   * @param {Request} req
   * @param {Response} res
   * @memberof BatchesController
   */
  async updateBatch(req: Request, res: Response) {
    // make a shorthand for out body so organizing is easier
    const input = req.body;

    // ************************* //
    // ****** UPDATE BATCH ***** //
    // ************************* //

    await this.connect();

    // pull the info from the input about the batch
    const batch: Batch = {
      name: String(input.name),
      volume: Number(input.volume),
      bright: Number(input.bright),
      generation: Number(input.generation),
      started_on: new Date().toUTCString(),
      recipe_id: Number(input.recipe_id),
      tank_id: Number(input.tank_id),
      update_user: Number(input.update_user)
    };
    let { keys, values, escapes } = this.splitObjectKeyVals(batch);

    // Get active batch
    const batchResults = await this.readById(input.batch_id);

    // if the item does not exist
    if (batchResults.rowCount === 0) {
      res.status(404).end();
    } else {
      try {
        // set an update
        const { query, idx } = await this.buildUpdateString(keys);
        values.push(input.batch_id);
        // update the batch
        await this.connect();
        await this.update(query, `id = \$${idx}`, values);
        await this.disconnect();
      } catch (err) {
        res.status(400).send(Boom.badRequest(err));
      }
    }

    // **************************** //
    // ****** CREATE VERSION ****** //
    // **************************** //

    // pull the information for our version
    const version = {
      sg: input.sg,
      ph: input.ph,
      abv: input.abv,
      temperature: input.temperature,
      pressure: input.pressure,
      // if our measured on time was not given, set it to now
      measured_on: input.measured_on ? input.measured_on : new Date().toUTCString(),
      batch_id: input.batch_id,
      update_user: input.update_user
    };

    // rebuild the keys, values and escapes, but do it with the version object
    const split = this.splitObjectKeyVals(version);
    keys = split.keys;
    values = split.values;
    escapes = split.escapes;

    // put our version info in the versions table
    try {
      await this.connect();
      const result = await this.createInTable(keys, 'versions', escapes, values);
      await this.disconnect();
      console.log(result);
      res.status(201).end();
    } catch (err) {
      res.status(400).send(Boom.badRequest(err));
    }

    await this.disconnect();
  }

  /**
   * Updates an existing batch.
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof BatchesController
   */
  async createBatch(req: Request, res: Response, next: NextFunction) {
    const batch: Batch = req.body;
    batch.started_on =  new Date().toUTCString();
    const { keys, values, escapes } = this.splitObjectKeyVals(req.body);
    try {
      await this.connect();
      const results = await this.create(keys, escapes, values);
      res.status(200).json(results.rows[0]);
    } catch (err) {
      res.status(500).send(Boom.badImplementation(err));
    }
    await this.disconnect();
  }

  /**
   * Deletes a batch.
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof BatchesController
   */
  async deleteBatch(req: Request, res: Response, next: NextFunction) {
    try {
      await this.connect();
      // remove the versions tied to that batch
      const versions = await this.client.query(
        `DELETE FROM versions
        WHERE batch_id = $1`,
        [req.params.id]
      );
      await this.disconnect();

      // remove the batch
      await this.connect();
      const batch = await this.deleteById(req.params.id);
      await this.disconnect();

      if (batch.rowCount > 0) {
        res.status(200).json({
          msg: 'Success',
          deletedVersions: versions.rowCount,
          deletedBatches: batch.rowCount
        });
      } else {
        next();
      }
    } catch (err) {
      res.status(500).send(Boom.badImplementation(err));
    }
  }

  /**
   * Closes a batch.
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof BatchesController
   */
  async closeBatch(req: Request, res: Response, next: NextFunction) {
    const batchId = req.params.id;

    try {
      const batch = {
        completed_on: new Date().toUTCString()
      };

      const { keys, values, escapes } = this.splitObjectKeyVals(batch);
      // set an update
      const { query, idx } = await this.buildUpdateString(keys);
      values.push(batchId);

      // update the batch
      await this.connect();
      const results = await this.update(query, `id = \$${idx}`, values);
      await this.disconnect();

      res.status(200).end();
    } catch(err) {
      res.status(500).send(Boom.badImplementation(err));
    }
  }
}
