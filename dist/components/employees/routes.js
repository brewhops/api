"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const validator_1 = require("./validator");
const controller_1 = require("./controller");
const auth_1 = require("./../../middleware/auth");
const boom_1 = __importDefault(require("boom"));
// tslint:disable:no-any no-unsafe-any
// tslint:disable-next-line:no-var-requires no-require-imports
const validate = require('express-validation');
function routes() {
    const controller = new controller_1.EmployeeController('employees');
    const router = express_1.Router();
    // tslint:disable-next-line:no-void-expression
    router.use((req, res, next) => next()); // init
    // [GET] section
    router.get('/', async (req, res, next) => controller.getEmployees(req, res, next));
    router.get('/admin/:username', async (req, res, next) => controller.verifyAdmin(req, res, next));
    router.get('/id/:id', auth_1.requireAuthentication, async (req, res, next) => controller.getEmployee(req, res, next));
    // [POST] section
    router.post('/', validate(validator_1.EmployeeValidator.createEmployee), auth_1.requireAuthentication, async (req, res, next) => controller.createEmployee(req, res, next));
    router.post('/login', validate(validator_1.EmployeeValidator.login), async (req, res, next) => controller.login(req, res, next));
    // [PATCH] section
    router.patch('/id/:id', validate(validator_1.EmployeeValidator.updateEmployee), auth_1.requireAuthentication, async (req, res, next) => controller.updateEmployee(req, res, next));
    // [DELETE] section
    router.delete('/id/:id', auth_1.requireAuthentication, async (req, res, next) => controller.deleteEmployee(req, res, next));
    router.use('*', (req, res) => res.status(400).send(boom_1.default.badRequest(`${req.originalUrl} doesn't exist`)));
    return router;
}
exports.routes = routes;
//# sourceMappingURL=routes.js.map