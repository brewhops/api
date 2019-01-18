import { PostgresController } from '../../dal/postgres';
import { Request, Response, NextFunction } from 'express';

// tslint:disable:no-any no-unsafe-any no-console
/**
 * Logic for the 'batches' route
 *
 * @export
 * @class BatchesLogic
 * @extends {PostgresController}
 */
export class BatchesLogic extends PostgresController {
  constructor(tableName: string) {
    super(tableName);
  }

  // GET
  async getBatches(req: Request, res: Response) {
    try {
      const { rows } = await this.read();
      res.json(rows);
    } catch (error) {
      res.status(500);
      res.send(error);
    }
  }

  async getBatch(req: Request, res: Response, next: NextFunction) {
    const results = await this.readById(req.params.id);
    if (results.rowCount > 0) {
      res.json(results.rows[0]);
    } else {
      next();
    }
  }

  async getBatchHistory(req: Request, res: Response, next: NextFunction) {
    const results = await this.readById(req.params.id);
    if (results.rowCount > 0) {
      const versions = await this.client.query(
        `SELECT * FROM versions
        WHERE batch_id = $1`,
        [req.params.id]
      );
      const response = results.rows[0];
      response.history = versions.rows;
      res.json(response);
    } else {
      next();
    }
  }

  // POST
  // tslint:disable:max-func-body-length
  async createBatch(req: Request, res: Response) {
    // make a shorthand for out body so organizing is easier
    const input = req.body;

    // check to see if the item already exists
    let results = await this.read('id', 'name=$1', [req.body.name]);

    // ************************* //
    // ***** CREATE BATCH ****** //
    // ************************* //

    // pull the info from the input about the batch
    const batch = {
      name: input.name,
      volume: input.volume,
      bright: input.bright,
      generation: input.generation,
      started_on: new Date().toUTCString(),
      recipe_id: input.recipe_id,
      tank_id: input.tank_id
    };
    let { keys, values, escapes } = this.splitObjectKeyVals(batch);

    // if the item does not exist
    if (results.rowCount === 0) {
      try {
        results = await this.create(keys, escapes, values);
      } catch (e) {
        res.status(400).json(e);

        return;
      }
      // add the batch
    } else {
      // get the id of the current batch
      const batchID = results.rows[0].id;
      // set an update
      const { query, idx } = await this.buildUpdateString(keys);
      values.push(batchID);
      // update the batch
      try {
        results = await this.update(query, `id = \$${idx}`, values); // eslint-disable-line
      } catch (e) {
        res.status(400).json(e);

        return;
      }
    }

    const batchID = results.rows[0].id;
    let split;

    // ************************* //
    // ****** CREATE TASK ****** //
    // ************************* //

    // if there is an action
    if (input.action) {
      // build up our info to insert
      const tasksInfo: any = {
        assigned: input.action.assigned,
        batch_id: batchID,
        action_id: input.action.id,
        employee_id: input.action.employee.id
      };

      // if our batch action is done
      if (input.action.completed) {
        tasksInfo.completed_on = new Date().toUTCString();
      } else {
        tasksInfo.added_on = new Date().toUTCString();
      }

      // check if task already exists
      let taskExists;
      try {
        taskExists = await this.client.query(
          `SELECT * FROM tasks
          WHERE completed_on IS NULL
          AND batch_id = $1`,
          [batchID]
        );
      } catch (e) {
        res.status(400).json(e);
      }

      // parse it out
      split = this.splitObjectKeyVals(tasksInfo);
      keys = split.keys;
      values = split.values;
      escapes = split.escapes;

      if (taskExists && taskExists.rowCount > 0) {
        // get the taskID
        const taskID = taskExists.rows[0].id;

        // update the task
        this.client
          .query(
            `UPDATE tasks SET (${keys}) = (${escapes}) WHERE id = ${taskID} RETURNING *`,
            values
          )
          .catch(e => {
            console.error('Update Error', e);

            return res.status(400).json(e);
          });
      } else {
        // dont let the user try and finish a task that has not started
        if (input.action.completed) {
          res.status(400).json({
            name: 'error',
            detail: 'You can not close a task that has not yet been opened'
          });
        } else {
          // insert a new task
          this.createInTable(keys, 'tasks', escapes, values).catch(e => {
            console.error('Create Error', e);

            return res.status(400).json(e);
          });
        }
      }
    }

    // **************************** //
    // ****** CREATE VERSION ****** //
    // **************************** //

    // pull the information for our version
    const version = {
      SG: input.SG,
      PH: input.PH,
      ABV: input.ABV,
      temperature: input.temperature,
      pressure: input.pressure,
      // if our measured on time was not given, set it to now
      measured_on: input.measured_on ? input.measured_on : new Date().toUTCString(),
      // get the batch id
      batch_id: batchID
    };

    // rebuild the keys, values and escapes, but do it with the version object
    split = this.splitObjectKeyVals(version);
    keys = split.keys;
    values = split.values;
    escapes = split.escapes;

    // put our version info in the versions table
    this.createInTable(keys, 'versions', escapes, values)
      // send back the all ok
      .then(submittedValue => {
        res.status(201).end();
      })
      // log and return errors if we had a problem
      .catch(error => {
        console.error(error);
        res.status(400).json(error);
      });
  }

  // PATCH
  async updateBatch(req: Request, res: Response, next: NextFunction) {
    const { keys, values } = this.splitObjectKeyVals(req.body);
    const { query, idx } = await this.buildUpdateString(keys);
    values.push(req.params.id);

    const results = await this.update(query, `id = \$${idx}`, values); // eslint-disable-line
    if (results.rowCount > 0) {
      res.json(results.rows[0]);
    } else {
      next();
    }
  }

  // DELETE
  async deleteBatch(req: Request, res: Response, next: NextFunction) {
    // remove the versions tied to that batch
    const versions = await this.client.query(
      `DELETE FROM versions
      WHERE batch_id = $1`,
      [req.params.id]
    );
    // remove the batch
    const batch = await this.deleteById(req.params.id);
    if (batch.rowCount > 0) {
      res.json({
        msg: 'Success',
        deletedVersions: versions.rowCount,
        deletedBatches: batch.rowCount
      });
    } else {
      next();
    }
  }
}
