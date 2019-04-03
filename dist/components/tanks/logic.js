"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postgres_1 = require("../../dal/postgres");
const is_1 = __importDefault(require("is"));
const boom_1 = __importDefault(require("boom"));
/**
 * Logic for tanks
 * @export
 * @class tankLogic
 * @extends {postgres}
 */
class TankController extends postgres_1.PostgresController {
    constructor(tableName) {
        super(tableName);
    }
    // GET
    async getTanks(req, res) {
        try {
            await this.connect();
            const { rows } = await this.read();
            res.json(rows);
        }
        catch (err) {
            res.json(boom_1.default.badImplementation(err));
        }
        await this.disconnect();
    }
    async getTank(req, res, next) {
        try {
            await this.connect();
            // get the tank by that ID
            const { rows } = await this.readById(req.params.id);
            // if it returns at least one tank
            if (rows.length > 0) {
                // return that tank
                res.json(rows[0]);
            }
            else {
                // let the user know that tank does not exist
                next();
            }
        }
        catch (err) {
            res.json(boom_1.default.badRequest(err));
        }
        await this.disconnect();
    }
    async getTankMonitoring(req, res, next) {
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
        }
        catch (err) {
            res.json(boom_1.default.badImplementation(err));
        }
        await this.disconnect();
    }
    // POST
    async createTank(req, res) {
        const { keys, values, escapes } = this.splitObjectKeyVals(req.body);
        try {
            await this.connect();
            const { rows } = await this.create(keys, escapes, values);
            res.status(201).json(rows[0]);
        }
        catch (err) {
            res.json(boom_1.default.badRequest(err));
        }
        await this.disconnect();
    }
    // PUT/PATCH
    async updateTank(req, res, next) {
        if (is_1.default.empty(req.body)) {
            res.json(boom_1.default.badRequest('Request does not match valid form'));
        }
        else {
            const { keys, values } = this.splitObjectKeyVals(req.body);
            const { query, idx } = this.buildUpdateString(keys);
            values.push(req.params.id); // add last escaped value for where clause
            try {
                const { rows } = await this.update(query, `id = \$${idx}`, values); // eslint-disable-line
                if (rows.length > 0) {
                    res.json(rows);
                }
                else {
                    next();
                }
            }
            catch (err) {
                res.json(boom_1.default.badImplementation(err));
            }
        }
    }
    // DELETE
    async deleteTank(req, res, next) {
        try {
            await this.connect();
            const { rows } = await this.deleteById(req.params.id);
            if (rows.length > 0) {
                res.status(200).json(rows);
            }
            else {
                next();
            }
        }
        catch (err) {
            res.json(boom_1.default.badImplementation(err));
        }
        await this.disconnect();
    }
}
exports.TankController = TankController;
//# sourceMappingURL=logic.js.map