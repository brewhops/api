import Boom from "boom";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { IPostgresController, PostgresController } from "../../dal/postgres";

// tslint:disable: no-unsafe-any

export interface IVersionController extends IPostgresController {
  getVersionsByBatch: RequestHandler;
  patchVersion: RequestHandler;
  deleteVersion: RequestHandler;
}

/**
 * Controller for the tasks route
 * @export
 * @class VersionController
 * @extends {PostgresController}
 * @implements {IVersionController}
 */
export class VersionController extends PostgresController implements IVersionController {

  constructor(tableName: string) {
    super(tableName);
  }

  /**
   * Returns all versions from the coresponding batch
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof TaskController
   */
  public async getVersionsByBatch(req: Request, res: Response, next: NextFunction) {
    const { batchId } = req.params;
    try {
      const { rows } = await this.pool.query(`SELECT * FROM versions WHERE batch_id = ${batchId}`);

      res.status(200).json(rows);
    } catch (err) {
      res.status(500).send(Boom.badImplementation(err));
    }
  }

  /**
   * Patches an existing version.
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof VersionController
   */
  public async patchVersion(req: Request, res: Response, next: NextFunction) {
    // Find current entity
    const results = await this.readById(req.params.id);

    const { keys, values, escapes } = this.splitObjectKeyVals(req.body);

    // if the item does not exist
    if (results.rowCount === 0) {
      res.status(404).end();
    } else {
      try {
        // set an update
        const { query, idx } = await this.buildUpdateString(keys);
        values.push(req.params.id);

        // update the entity
        await this.update(query, `id = \$${idx}`, values);

        res.status(204).end();
      } catch (err) {
        res.status(500).send(Boom.badRequest(err));
      }
    }
  }

  /**
   * Deletes a version.
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof VersionController
   */
  public async deleteVersion(req: Request, res: Response, next: NextFunction) {
    try {
      // remove the version
      const version = await this.deleteById(req.params.id);

      if (version.rowCount > 0) {
        res.status(200).json({
          deletedVersions: version.rowCount,
          msg: "Success",
        });
      } else {
        next();
      }
    } catch (err) {
      res.status(500).send(Boom.badImplementation(err));
    }
  }

}
