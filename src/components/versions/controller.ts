import { PostgresController, IPostgresController } from '../../dal/postgres';
import { Client } from 'pg';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import Boom from 'boom';

// tslint:disable: no-unsafe-any

export interface IVersionController extends IPostgresController {
  getVersionsByBatch: RequestHandler;
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
   * Returns all versions from the cooresponding batch
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof TaskController
   */
  async getVersionsByBatch(req: Request, res: Response, next: NextFunction) {
    const { batchId } = req.params;
    try {
      const { rows } = await this.query(`SELECT * FROM versions WHERE batch_id = ${batchId}`);

      res.status(200).json(rows);
    } catch (err) {
      res.status(500).send(Boom.badImplementation(err));
    }
  }

}