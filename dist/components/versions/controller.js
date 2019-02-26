"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postgres_1 = require("../../dal/postgres");
const boom_1 = __importDefault(require("boom"));
/**
 * Controller for the tasks route
 * @export
 * @class VersionController
 * @extends {PostgresController}
 * @implements {IVersionController}
 */
class VersionController extends postgres_1.PostgresController {
    constructor(tableName) {
        super(tableName);
    }
    /**
     * Returns all versions from the cooresponding batch
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @memberof TaskController
     */
    async getVersionsByBatch(req, res, next) {
        const { batchId } = req.params;
        try {
            const { rows } = await this.pool.query(`SELECT * FROM versions WHERE batch_id = ${batchId}`);
            res.status(200).json(rows);
        }
        catch (err) {
            res.status(500).send(boom_1.default.badImplementation(err));
        }
    }
}
exports.VersionController = VersionController;
//# sourceMappingURL=controller.js.map