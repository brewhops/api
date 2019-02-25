"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postgres_1 = require("../../dal/postgres");
const boom_1 = __importDefault(require("boom"));
const is_1 = __importDefault(require("is"));
/**
 * Controller class for the 'actions' routes
 * @export
 * @class ActionController
 * @extends {PostgresController}
 * @implements {IActionController}
 */
class ActionController extends postgres_1.PostgresController {
    constructor(tableName) {
        super(tableName);
    }
    /**
     * Returns an array of all available actions.
     * @param req
     * @param res
     */
    async getActions(req, res) {
        try {
            const { rows } = await this.read('*', '$1', [true]);
            res.status(200).json(rows);
        }
        catch (err) {
            res.status(500).send(boom_1.default.badImplementation(err));
        }
    }
    /**
     * Returns a single action by id.
     * @param req
     * @param res
     * @param next
     */
    async getAction(req, res, next) {
        try {
            const { rows } = await this.readById(req.params.id);
            if (rows.length > 0) {
                res.status(200).json(rows[0]);
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
     * Creates a new action.
     * @param req
     * @param res
     */
    async createAction(req, res) {
        const { keys, values, escapes } = this.splitObjectKeyVals(req.body);
        try {
            const { rows } = await this.create(keys, escapes, values);
            res.status(201).json(rows[0]);
        }
        catch (err) {
            res.status(500).send(boom_1.default.badImplementation(err));
        }
    }
    /**
     * Updates an action.
     * @param req
     * @param res
     * @param next
     */
    async updateAction(req, res, next) {
        if (is_1.default.empty(req.body)) {
            res.status(400).send(boom_1.default.badRequest('Request does not match valid form'));
        }
        else {
            const { keys, values } = this.splitObjectKeyVals(req.body);
            const { query, idx } = this.buildUpdateString(keys);
            values.push(req.params.id); // add last escaped value for where clause
            try {
                const { rows } = await this.update(query, `id = \$${idx}`, values); // eslint-disable-line
                if (rows.length > 0) {
                    res.status(200).json(rows[0]);
                }
                else {
                    next();
                }
            }
            catch (err) {
                res.status(500).send(boom_1.default.badImplementation(err));
            }
        }
    }
    /**
     * Deletes an action.
     * @param req
     * @param res
     * @param next
     */
    async deleteAction(req, res, next) {
        const { id } = req.params;
        try {
            const response = await this.deleteById(id);
            if (response.rowCount > 0) {
                res.status(200).json(`Successfully deleted action (id=${id}).`);
            }
            else {
                next();
            }
        }
        catch (err) {
            res.status(500).send(boom_1.default.badImplementation(err));
        }
    }
}
exports.ActionController = ActionController;
//# sourceMappingURL=controller.js.map