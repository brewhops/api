"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postgres_1 = require("../../dal/postgres");
const boom_1 = __importDefault(require("boom"));
/**
 * Controller for the tasks route
 * @export
 * @class TaskController
 * @extends {PostgresController}
 * @implements {ITaskController}
 */
class TaskController extends postgres_1.PostgresController {
    constructor(tableName) {
        super(tableName);
    }
    /**
     * Returns all tasks in the database
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @memberof TaskController
     */
    async getTasks(req, res, next) {
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
     * Returns tasks for a batch
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @memberof TaskController
     */
    async getTasksByBatch(req, res, next) {
        try {
            await this.connect();
            const { rows } = await this.read('*', 'batch_id = $1', [req.params.batchId]);
            res.status(200).json(rows);
        }
        catch (err) {
            res.status(500).send(boom_1.default.badImplementation(err));
        }
        await this.disconnect();
    }
    /**
     * Creates new task in the database
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @memberof TaskController
     */
    async createTask(req, res, next) {
        const _a = req.body, { id } = _a, taskInfo = __rest(_a, ["id"]);
        try {
            await this.connect();
            const taskExists = await this.client.query(`SELECT * FROM tasks
        WHERE completed_on IS NULL
        AND batch_id = $1`, [taskInfo.batch_id]);
            if (taskExists.rowCount === 0) {
                // dont let the user try and finish a task that has not started
                if (!taskInfo.completed_on) {
                    // parse it out
                    const { keys, values, escapes } = this.splitObjectKeyVals(taskInfo);
                    const results = await this.createInTable(keys, this.tableName(), escapes, values);
                    if (results.rows.length === 1) {
                        res.status(201).json(results.rows[0]);
                    }
                    else {
                        res.status(500).send('Failed to retrieve object after creation.');
                    }
                }
                else {
                    res.status(400).send(boom_1.default.badRequest('You can not close a task that has not yet been opened'));
                }
            }
            else {
                res.status(400).send(boom_1.default.badRequest('You can only have one open task per batch.'));
            }
        }
        catch (err) {
            res.status(500).send(boom_1.default.badRequest(err));
        }
        await this.disconnect();
    }
    /**
     * Updates existing task in the database
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @memberof TaskController
     */
    async updateTask(req, res, next) {
        const _a = req.body, { id } = _a, taskInfo = __rest(_a, ["id"]);
        try {
            if (id !== undefined) {
                // parse it out
                const { keys, values } = this.splitObjectKeyVals(taskInfo);
                const { query, idx } = this.buildUpdateString(keys);
                values.push(id);
                // insert a new task
                await this.connect();
                const results = await this.update(query, `id = \$${idx}`, values);
                if (results.rowCount > 0) {
                    res.status(200).json(results.rows[0]);
                }
                else {
                    res.status(404).end();
                }
            }
            else {
                res.status(400).send(boom_1.default.badRequest('Must include task id.'));
            }
        }
        catch (err) {
            res.status(500).send(boom_1.default.badRequest(err));
        }
        await this.disconnect();
    }
}
exports.TaskController = TaskController;
//# sourceMappingURL=controller.js.map