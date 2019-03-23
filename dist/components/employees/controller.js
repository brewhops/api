"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postgres_1 = require("../../dal/postgres");
const boom_1 = __importDefault(require("boom"));
const auth_1 = require("../../middleware/auth");
const auth_2 = require("../../util/auth");
const saltRounds = 8;
const safeUserData = 'id, first_name, last_name, username, phone, admin';
/**
 * Class that defined the logic for the 'user' route
 * @export
 * @class EmployeeController
 * @extends {PostgresController}
 * @implements {IEmployeeController}
 */
class EmployeeController extends postgres_1.PostgresController {
    constructor(tableName) {
        super(tableName);
    }
    /**
     * Returns an array of users
     * @param {Request} req
     * @param {Response} res
     * @memberof EmployeeController
     */
    async getEmployees(req, res) {
        try {
            const { rows } = await this.read(safeUserData, '$1', [true]);
            res.status(200).json(rows);
        }
        catch (err) {
            res.status(500).send(boom_1.default.badImplementation(err));
        }
    }
    /**
     * Returns a user by id
     * @param {Request} req
     * @param {Response} res
     * @memberof EmployeeController
     */
    async getEmployee(req, res) {
        try {
            const { rows } = await this.readById(req.params.id);
            res.status(200).json(rows);
        }
        catch (err) {
            res.status(400).send(boom_1.default.badRequest(err));
        }
    }
    /**
     * Creates a new employee.
     * @param {Request} req
     * @param {Response} res
     * @memberof EmployeeController
     */
    async createEmployee(req, res) {
        const { username, password } = req.body;
        try {
            const prevUser = await this.readByUsername(username);
            const { keys, values, escapes } = this.splitObjectKeyVals(Object.assign({}, req.body, { password }));
            if (prevUser.rows.length !== 0) {
                res.status(400).send(boom_1.default.badRequest('Username already taken'));
            }
            else {
                const { rows } = await this.create(keys, escapes, values, safeUserData);
                const returnedUser = rows[0];
                returnedUser.token = await auth_1.generateAuthToken(returnedUser.username);
                res.status(201).json(rows[0]);
            }
        }
        catch (err) {
            res.status(500).send(boom_1.default.badImplementation(err));
        }
    }
    /**
     * Verifies an employee in the database and returns an authentication token for that user.
     * @param {Request} req
     * @param {Response} res
     * @memberof EmployeeController
     */
    async login(req, res) {
        const { username, password } = req.body;
        try {
            const prevUser = await this.readByUsername(username);
            if (prevUser.rows.length === 0) {
                res.status(401).send(boom_1.default.unauthorized('Not authorized'));
            }
            else {
                const id = prevUser.rows[0].id;
                const stored = prevUser.rows[0].password;
                // tslint:disable-next-line:possible-timing-attack
                const match = password === stored;
                if (match) {
                    const token = await auth_1.generateAuthToken(req.body.username);
                    res.status(200).json({
                        id,
                        token
                    });
                }
                else {
                    res.status(400).send(boom_1.default.badRequest('Incorrect password'));
                }
            }
        }
        catch (err) {
            res.status(500).send(boom_1.default.badImplementation(err));
        }
    }
    /**
     * Updates an employee's information.
     * @param {Request} req
     * @param {Response} res
     * @memberof EmployeeController
     */
    async updateEmployee(req, res) {
        try {
            const { keys, values } = this.splitObjectKeyVals(req.body);
            const { query, idx } = this.buildUpdateString(keys);
            values.push(req.params.id); // add last escaped value for where clause
            const { rows } = await this.readById(req.params.id);
            if (rows.length > 0) {
                if (await this.isAdmin(req.user)) {
                    const results = await this.update(query, `id = \$${idx}`, values); // eslint-disable-line
                    res.status(200).json(`Deleted ${results.rowCount} user`);
                }
                else {
                    res.status(401).send(boom_1.default.unauthorized('Not authorized.'));
                }
            }
            else {
                res.status(500).send(boom_1.default.badImplementation(`User down not exist`));
            }
        }
        catch (err) {
            res.status(500).send(boom_1.default.badImplementation(err));
        }
    }
    /**
     * Removes an employee from the database.
     * @param {Request} req
     * @param {Response} res
     * @memberof EmployeeController
     */
    async deleteEmployee(req, res) {
        try {
            const { rows } = await this.readById(req.params.id);
            if (rows.length > 0) {
                if (await this.isAdmin(req.user) && !auth_2.userMatchAuthToken(req.user, rows[0].username)) {
                    const results = await this.deleteById(req.params.id);
                    res.status(200).json(results.rows);
                }
                else {
                    res.status(401).send(boom_1.default.unauthorized('Not authorized.'));
                }
            }
            else {
                res.status(500).send(boom_1.default.badImplementation(`User down not exist`));
            }
        }
        catch (err) {
            res.status(500).send(boom_1.default.badImplementation(err));
        }
    }
    /**
     *
     *
     * @param {Request} req
     * @param {Response} res
     * @memberof EmployeeController
     */
    async verifyAdmin(req, res) {
        const { username } = req.params;
        try {
            const isAdmin = await this.isAdmin(username);
            res.status(200).json(isAdmin);
        }
        catch (err) {
            res.status(200).json(false);
        }
    }
    /**
     * Determines whether the surrent user is an administrator.
     * @param {string} username
     * @returns
     * @memberof EmployeeController
     */
    async isAdmin(username) {
        let isAdmin = false;
        try {
            const { rows } = await this.readByUsername(username);
            isAdmin = rows[0].admin;
        }
        catch (err) {
            throw err;
        }
        return isAdmin;
    }
}
exports.EmployeeController = EmployeeController;
//# sourceMappingURL=controller.js.map