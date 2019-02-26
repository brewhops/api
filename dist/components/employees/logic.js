"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const postgres_1 = require("../../dal/postgres");
const bcrypt_1 = __importDefault(require("bcrypt"));
const boom_1 = __importDefault(require("boom"));
const auth_1 = require("./../../middleware/auth");
const auth_2 = require("../../util/auth");
const saltRounds = 8;
const safeUserData = 'id, first_name, last_name, username, phone, admin';
/**
 * Class that defined the logic for the 'user' route
 * @export
 * @class UserLogic
 * @extends {PostgresController}
 */
class EmployeeController extends postgres_1.PostgresController {
    constructor(tableName) {
        super(tableName);
    }
    // GET
    async getUsers(req, res) {
        try {
            await this.connect();
            const { rows } = await this.read(safeUserData, '$1', [true]);
            res.status(200).json(rows);
            await this.disconnect();
        }
        catch (err) {
            res.json(boom_1.default.badImplementation(err));
        }
    }
    async getUser(req, res) {
        try {
            await this.connect();
            const { rows } = await this.readById(req.params.id);
            res.status(200).json(rows);
            await this.disconnect();
        }
        catch (err) {
            res.json(boom_1.default.badRequest(err));
        }
    }
    // POST
    async createUser(req, res) {
        const { username, password: pw } = req.body;
        try {
            await this.connect();
            const prevUser = await this.readByUsername(username);
            const password = bcrypt_1.default.hashSync(pw, saltRounds);
            const { keys, values, escapes } = this.splitObjectKeyVals(Object.assign({}, req.body, { password }));
            if (prevUser.rows.length !== 0) {
                res.json(boom_1.default.badRequest('Username already taken'));
            }
            else {
                const { rows } = await this.create(keys, escapes, values, safeUserData);
                const returnedUser = rows[0];
                returnedUser.token = await auth_1.generateAuthToken(returnedUser.username);
                res.status(201).json(rows[0]);
            }
        }
        catch (err) {
            res.json(boom_1.default.badImplementation(err));
        }
        await this.disconnect();
    }
    async login(req, res) {
        const { username, password } = req.body;
        try {
            await this.connect();
            const prevUser = await this.readByUsername(username);
            if (prevUser.rows.length === 0) {
                res.json(boom_1.default.unauthorized('Not authorized'));
            }
            else {
                const userID = prevUser.rows[0].id;
                const match = bcrypt_1.default.compareSync(password, prevUser.rows[0].password);
                if (match) {
                    const token = await auth_1.generateAuthToken(req.body.username);
                    res.status(200).json({
                        token,
                        userID
                    });
                }
                else {
                    res.json(boom_1.default.badRequest('Incorrect password'));
                }
            }
        }
        catch (err) {
            res.json(boom_1.default.badImplementation(err));
        }
        await this.disconnect();
    }
    // PATCH/PUT
    async updateUser(req, res) {
        try {
            await this.connect();
            const { keys, values } = this.splitObjectKeyVals(req.body);
            const { query, idx } = this.buildUpdateString(keys);
            values.push(req.params.id); // add last escaped value for where clause
            const { rows } = await this.readById(req.params.id);
            if (rows.length === 0 || !auth_2.userMatchAuthToken(req.user, rows[0].username)) {
                res.json(boom_1.default.badRequest('Not Authorized'));
            }
            else {
                const results = await this.update(query, `id = \$${idx}`, values); // eslint-disable-line
                res.json(results.rows);
            }
        }
        catch (err) {
            res.json(boom_1.default.badImplementation(err));
        }
        await this.disconnect();
    }
    // DELETE
    async deleteUser(req, res) {
        try {
            await this.connect();
            const { rows } = await this.readById(req.params.id);
            if (rows.length === 0 || !auth_2.userMatchAuthToken(req.user, rows[0].username)) {
                res.json(boom_1.default.badRequest('Not Authorized'));
            }
            else {
                const results = await this.deleteById(req.params.id);
                res.json(results.rows);
            }
        }
        catch (err) {
            res.json(boom_1.default.badImplementation(err));
        }
        await this.disconnect();
    }
}
exports.EmployeeController = EmployeeController;
//# sourceMappingURL=logic.js.map