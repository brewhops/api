"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postgres_1 = require("../../dal/postgres");
const boom_1 = __importDefault(require("boom"));
// tslint:disable:no-any no-unsafe-any no-console
/**
 * Controller class for the 'batches' route
 * @export
 * @class BatchesController
 * @extends {PostgresController}
 * @implements {IBatchesController}
 */
class BatchesController extends postgres_1.PostgresController {
    constructor(tableName) {
        super(tableName);
    }
    /**
     * Returns an array of all batches.
     * @param {Request} req
     * @param {Response} res
     * @memberof BatchesController
     */
    async getBatches(req, res) {
        try {
            await this.connect();
            const { rows } = await this.read('*', '$1', [true]);
            res.status(200).json(rows);
        }
        catch (err) {
            res.status(500).send(boom_1.default.badImplementation(err));
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
    async getBatchesByTank(req, res, next) {
        try {
            await this.connect();
            const { rows } = await this.read('*', 'tank_id = $1', [req.params.tankId]);
            res.status(200).json(rows);
        }
        catch (err) {
            res.status(500).send(boom_1.default.badImplementation(err));
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
    async getBatch(req, res, next) {
        try {
            await this.connect();
            const results = await this.readById(req.params.id);
            if (results.rowCount > 0) {
                res.status(200).json(results.rows[0]);
            }
            else {
                next();
            }
        }
        catch (err) {
            res.status(500).send(boom_1.default.badImplementation(err));
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
    async updateBatch(req, res) {
        // make a shorthand for out body so organizing is easier
        const input = req.body;
        await this.connect();
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
                await this.connect();
                results = await this.create(keys, escapes, values);
            }
            catch (err) {
                res.status(400).send(boom_1.default.badRequest(err));
                await this.disconnect();
                return;
            }
            // add the batch
        }
        else {
            // get the id of the current batch
            const batchID = results.rows[0].id;
            try {
                // set an update
                const { query, idx } = await this.buildUpdateString(keys);
                values.push(batchID);
                // update the batch
                await this.connect();
                results = await this.update(query, `id = \$${idx}`, values); // eslint-disable-line
            }
            catch (err) {
                res.status(400).send(boom_1.default.badRequest(err));
                await this.disconnect();
                return;
            }
        }
        const batchID = results.rows[0].id;
        let split;
        // ************************* //
        // ****** CREATE TASK ****** //
        // ************************* //
        await this.connect();
        // if there is an action
        if (input.action.id) {
            // build up our info to insert
            const tasksInfo = {
                assigned: input.action.assigned,
                batch_id: batchID,
                action_id: input.action.id,
                employee_id: input.action.employee.id
            };
            // if our batch action is done
            if (input.action.completed) {
                tasksInfo.completed_on = new Date().toUTCString();
            }
            else {
                tasksInfo.added_on = new Date().toUTCString();
            }
            // check if task already exists
            let taskExists;
            try {
                await this.connect();
                taskExists = await this.client.query(`SELECT * FROM tasks
          WHERE completed_on IS NULL
          AND batch_id = $1`, [batchID]);
            }
            catch (err) {
                res.status(400).send(boom_1.default.badRequest(err));
            }
            // parse it out
            split = this.splitObjectKeyVals(tasksInfo);
            keys = split.keys;
            values = split.values;
            escapes = split.escapes;
            if (taskExists && taskExists.rowCount > 0) {
                // get the taskID
                const taskID = taskExists.rows[0].id;
                try {
                    // update the task
                    await this.client
                        .query(`UPDATE tasks SET (${keys}) = (${escapes}) WHERE id = ${taskID} RETURNING *`, values);
                }
                catch (err) {
                    res.status(400).send(boom_1.default.badRequest(err));
                }
            }
            else {
                // dont let the user try and finish a task that has not started
                if (input.action.completed) {
                    res.status(400).send(boom_1.default.badRequest('You can not close a task that has not yet been opened'));
                }
                else {
                    // insert a new task
                    try {
                        await this.createInTable(keys, 'tasks', escapes, values);
                    }
                    catch (err) {
                        res.status(400).send(boom_1.default.badRequest(err));
                    }
                }
            }
        }
        // **************************** //
        // ****** CREATE VERSION ****** //
        // **************************** //
        // pull the information for our version
        const version = {
            SG: input.sg,
            PH: input.ph,
            ABV: input.abv,
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
        try {
            await this.createInTable(keys, 'versions', escapes, values);
            res.status(201).end();
        }
        catch (err) {
            res.status(400).send(boom_1.default.badRequest(err));
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
    async createBatch(req, res, next) {
        const batch = req.body;
        batch.started_on = new Date().toUTCString();
        const { keys, values, escapes } = this.splitObjectKeyVals(req.body);
        try {
            await this.connect();
            const results = await this.create(keys, escapes, values);
            res.status(200).json(results.rows[0]);
        }
        catch (err) {
            res.status(500).send(boom_1.default.badImplementation(err));
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
    async deleteBatch(req, res, next) {
        // remove the versions tied to that batch
        const versions = await this.client.query(`DELETE FROM versions
      WHERE batch_id = $1`, [req.params.id]);
        // remove the batch
        try {
            await this.connect();
            const batch = await this.deleteById(req.params.id);
            if (batch.rowCount > 0) {
                res.status(200).json({
                    msg: 'Success',
                    deletedVersions: versions.rowCount,
                    deletedBatches: batch.rowCount
                });
            }
            else {
                next();
            }
        }
        catch (err) {
            res.status(500).send(boom_1.default.badImplementation(err));
        }
        await this.disconnect();
    }
}
exports.BatchesController = BatchesController;
//# sourceMappingURL=controller.js.map