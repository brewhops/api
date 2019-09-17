import Boom from "boom";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { IPostgresController, PostgresController } from "../../dal/postgres";
import { Batch, Version } from "./types";

export interface IBatchesController extends IPostgresController {
  getBatches: RequestHandler;
  getBatchesByTank: RequestHandler;
  getBatchesByRecipe: RequestHandler;
  getBatch: RequestHandler;
  createBatch: RequestHandler;
  updateBatch: RequestHandler;
  patchBatch: RequestHandler;
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
  public async getBatches(req: Request, res: Response) {
    try {
      const { rows } = await this.read("*", "$1", [true]);
      res.status(200).json(rows);
    } catch (err) {
      res.status(500).send(Boom.badImplementation(err));
    }
  }

  /**
   * Returns all versions from the coresponding batch
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof TaskController
   */
  public async getBatchesByTank(req: Request, res: Response, next: NextFunction) {
    try {
      const { rows } = await this.read("*", "tank_id = $1", [req.params.tankId]);
      res.status(200).json(rows);
    } catch (err) {
      res.status(500).send(Boom.badImplementation(err));
    }
  }

  /**
   * Returns all versions from the coresponding batch
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof TaskController
   */
  public async getBatchesByRecipe(req: Request, res: Response, next: NextFunction) {
    try {
      const { rows } = await this.read("*", "recipe_id = $1", [req.params.recipeId]);
      res.status(200).json(rows);
    } catch (err) {
      res.status(500).send(Boom.badImplementation(err));
    }
  }

  /**
   * Returns a single batch by id.
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof BatchesController
   */
  public async getBatch(req: Request, res: Response, next: NextFunction) {
    try {
      const results = await this.readById(req.params.id);
      if (results.rowCount > 0) {
        res.status(200).json(results.rows[0]);
      } else {
        next();
      }
    } catch (err) {
      res.status(500).send(Boom.badImplementation(err));
    }
  }

  // tslint:disable:max-func-body-length
  /**
   * Creates a new batch, task and version.
   * @param {Request} req
   * @param {Response} res
   * @memberof BatchesController
   */
  public async updateBatch(req: Request, res: Response) {
    // make a shorthand for out body so organizing is easier
    const input = req.body;

    // ************************* //
    // ****** UPDATE BATCH ***** //
    // ************************* //

    // pull the info from the input about the batch
    const batch: Batch = {
      bright: Number(input.bright),
      generation: Number(input.generation),
      name: String(input.name),
      recipe_id: Number(input.recipe_id),
      started_on: new Date().toUTCString(),
      tank_id: Number(input.tank_id),
      update_user: Number(input.update_user),
      volume: Number(input.volume),
      client_id: Number('client_id' in input ? input.client_id : 1)
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
        await this.update(query, `id = \$${idx}`, values);
      } catch (err) {
        res.status(400).send(Boom.badRequest(err));
      }
    }

    // **************************** //
    // ****** CREATE VERSION ****** //
    // **************************** //

    // pull the information for our version
    const version = {
      abv: input.abv,
      batch_id: input.batch_id,
      measured_on: input.measured_on ? input.measured_on : new Date().toUTCString(),
      ph: input.ph,
      pressure: input.pressure,
      sg: input.sg,
      temperature: input.temperature,
      // if our measured on time was not given, set it to now
      update_user: input.update_user,
    };

    // rebuild the keys, values and escapes, but do it with the version object
    const split = this.splitObjectKeyVals(version);
    keys = split.keys;
    values = split.values;
    escapes = split.escapes;

    // put our version info in the versions table
    try {
      const result = await this.createInTable(keys, "versions", escapes, values);

      res.status(201).end();
    } catch (err) {
      res.status(400).send(Boom.badRequest(err));
    }

  }

  /**
   * Patches an existing batch.
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof BatchesController
   */
  public async patchBatch(req: Request, res: Response, next: NextFunction) {
    const batchId = req.params.id;

    // Get active batch
    const batchResults = await this.readById(batchId);

    const { keys, values, escapes } = this.splitObjectKeyVals(req.body);

    // if the item does not exist
    if (batchResults.rowCount === 0) {
      res.status(404).end();
    } else {
      try {
        // set an update
        const { query, idx } = await this.buildUpdateString(keys);
        values.push(batchId);
        // update the batch
        await this.update(query, `id = \$${idx}`, values);

        res.status(204).end();
      } catch (err) {
        res.status(400).send(Boom.badRequest(err));
      }
    }
  }

  /**
   * Creates a new batch.
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof BatchesController
   */
  public async createBatch(req: Request, res: Response, next: NextFunction) {
    const batch: Batch = req.body;
    batch.started_on =  new Date().toUTCString();
    const { keys, values, escapes } = this.splitObjectKeyVals(req.body);
    try {
      const results = await this.create(keys, escapes, values);
      res.status(200).json(results.rows[0]);
    } catch (err) {
      res.status(500).send(Boom.badImplementation(err));
    }
  }

  /**
   * Deletes a batch.
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof BatchesController
   */
  public async deleteBatch(req: Request, res: Response, next: NextFunction) {
    try {
      // remove the versions tied to that batch
      const versions = await this.pool.query(
        `DELETE FROM versions
        WHERE batch_id = $1`,
        [req.params.id],
      );

      // remove the batch
      const batch = await this.deleteById(req.params.id);

      if (batch.rowCount > 0) {
        res.status(200).json({
          deletedBatches: batch.rowCount,
          deletedVersions: versions.rowCount,
          msg: "Success",
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
  public async closeBatch(req: Request, res: Response, next: NextFunction) {
    const batchId = req.params.id;

    try {
      const batch = {
        completed_on: new Date().toUTCString(),
      };

      const { keys, values } = this.splitObjectKeyVals(batch);
      // set an update
      const { query, idx } = await this.buildUpdateString(keys);
      values.push(batchId);

      // update the batch
      await this.update(query, `id = \$${idx}`, values);

      res.status(200).end();
    } catch (err) {
      res.status(500).send(Boom.badImplementation(err));
    }
  }
}
