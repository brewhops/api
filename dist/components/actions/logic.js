"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postgres_1 = require("../../dal/postgres");
const is_1 = __importDefault(require("is"));
// tslint:disable:no-any no-unsafe-any
/**
 * Defines the logic for the 'action' route
 * @export
 * @class ActionController
 * @extends {PostgresController}
 */
class ActionController extends postgres_1.PostgresController {
    constructor(tableName) {
        super(tableName);
    }
    // GET
    async getActions(req, res) {
        try {
            const { rows } = await this.read();
            res.json(rows);
        }
        catch (error) {
            res.status(500);
            res.send(error);
        }
    }
    async getAction(req, res, next) {
        try {
            const { rows } = await this.readById(req.params.id);
            if (rows.length > 0) {
                res.json(rows[0]);
            }
            else {
                next();
            }
        }
        catch (e) {
            res.status(500).json(e);
        }
    }
    // POST
    async createAction(req, res) {
        const { keys, values, escapes } = this.splitObjectKeyVals(req.body);
        const { rows } = await this.create(keys, escapes, values);
        res.status(201).json(rows[0]);
    }
    // PATCH/PUT
    async updateAction(req, res, next) {
        if (is_1.default.empty(req.body)) {
            res.status(400).json({ err: 'Request does not match valid form' });
        }
        else {
            const { keys, values } = this.splitObjectKeyVals(req.body);
            const { query, idx } = this.buildUpdateString(keys);
            values.push(req.params.id); // add last escaped value for where clause
            try {
                const { rows } = await this.update(query, `id = \$${idx}`, values); // eslint-disable-line
                if (rows.length > 0) {
                    res.json(rows[0]);
                }
                else {
                    next();
                }
            }
            catch (e) {
                res.status(500).json(e);
            }
        }
    }
    // DELETE
    async deleteAction(req, res, next) {
        try {
            const response = await this.deleteById(req.params.id);
            if (response.rowCount > 0) {
                res.status(200).json();
            }
            else {
                next();
            }
        }
        catch (e) {
            res.status(500).json(e);
        }
    }
}
exports.ActionController = ActionController;
//# sourceMappingURL=logic.js.map