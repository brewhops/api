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
            const { rows } = await this.read('*', '$1', [true]);
            res.status(200).json(rows);
        }
        catch (err) {
            res.status(500).send(boom_1.default.badImplementation(err));
        }
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
            const { rows } = await this.read('*', 'tank_id = $1', [req.params.tankId]);
            res.status(200).json(rows);
        }
        catch (err) {
            res.status(500).send(boom_1.default.badImplementation(err));
        }
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
        // ************************* //
        // ****** UPDATE BATCH ***** //
        // ************************* //
        // pull the info from the input about the batch
        const batch = {
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
        }
        else {
            try {
                // set an update
                const { query, idx } = await this.buildUpdateString(keys);
                values.push(input.batch_id);
                // update the batch
                await this.update(query, `id = \$${idx}`, values);
            }
            catch (err) {
                res.status(400).send(boom_1.default.badRequest(err));
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
            const result = await this.createInTable(keys, 'versions', escapes, values);
            res.status(201).end();
        }
        catch (err) {
            res.status(400).send(boom_1.default.badRequest(err));
        }
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
            const results = await this.create(keys, escapes, values);
            res.status(200).json(results.rows[0]);
        }
        catch (err) {
            res.status(500).send(boom_1.default.badImplementation(err));
        }
    }
    /**
     * Deletes a batch.
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @memberof BatchesController
     */
    async deleteBatch(req, res, next) {
        try {
            // remove the versions tied to that batch
            const versions = await this.pool.query(`DELETE FROM versions
        WHERE batch_id = $1`, [req.params.id]);
            // remove the batch
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
    }
    /**
     * Closes a batch.
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @memberof BatchesController
     */
    async closeBatch(req, res, next) {
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
            const results = await this.update(query, `id = \$${idx}`, values);
            res.status(200).end();
        }
        catch (err) {
            res.status(500).send(boom_1.default.badImplementation(err));
        }
    }
}
exports.BatchesController = BatchesController;
//# sourceMappingURL=controller.js.map