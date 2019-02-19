"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postgres_1 = require("../../dal/postgres");
const boom_1 = __importDefault(require("boom"));
const is_1 = __importDefault(require("is"));
/**
 * Controller class for the recipes routes
 * @export
 * @class RecipeController
 * @extends {PostgresController}
 * @implements {IRecipeController}
 */
class RecipeController extends postgres_1.PostgresController {
    constructor(tableName) {
        super(tableName);
    }
    /**
     * Returns an array of all recipes.
     * @param {Request} req
     * @param {Response} res
     * @memberof RecipeController
     */
    async getRecipes(req, res) {
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
     * Returns a single recipe by id.
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @memberof RecipeController
     */
    async getRecipe(req, res, next) {
        try {
            await this.connect();
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
        await this.disconnect();
    }
    /**
     * Creates a new recipe
     * @param {Request} req
     * @param {Response} res
     * @memberof RecipeController
     */
    async createRecipe(req, res) {
        const { keys, values, escapes } = this.splitObjectKeyVals(req.body);
        try {
            await this.connect();
            const { rows } = await this.create(keys, escapes, values);
            res.status(201).json(rows[0]);
        }
        catch (err) {
            res.status(500).send(boom_1.default.badImplementation(err));
        }
    }
    /**
     * Updates an existing recipe
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @memberof RecipeController
     */
    async updateRecipe(req, res, next) {
        if (is_1.default.empty(req.body)) {
            res.status(400).send(boom_1.default.badRequest('Request does not match valid form'));
        }
        else {
            const { keys, values } = this.splitObjectKeyVals(req.body);
            const { query, idx } = this.buildUpdateString(keys);
            values.push(req.params.id); // add last escaped value for where clause
            try {
                await this.connect();
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
            await this.disconnect();
        }
    }
    /**
     * Delets a recipe
     * @param {Request} req
     * @param {Response} res
     * @param {NextFunction} next
     * @memberof RecipeController
     */
    async deleteRecipe(req, res, next) {
        const { id } = req.params;
        try {
            await this.connect();
            const response = await this.deleteById(id);
            if (response.rowCount > 0) {
                res.status(200).json(`Successfully deleted recipe (id=${id})`);
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
exports.RecipeController = RecipeController;
//# sourceMappingURL=controller.js.map