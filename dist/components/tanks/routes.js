"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const validator_1 = require("./validator");
const auth_1 = require("./../../middleware/auth");
const boom_1 = __importDefault(require("boom"));
// tslint:disable:no-any no-unsafe-any no-console no-void-expression
// tslint:disable-next-line:no-require-imports no-var-requires
const validate = require('express-validation');
// tslint:disable-next-line:no-any
function routes() {
    const controller = new controller_1.TankController('tanks');
    const router = express_1.Router();
    // tslint:disable-next-line: no-void-expression
    router.use((req, res, next) => next()); // init
    // GET
    router.get('/', async (req, res, next) => controller.getTanks(req, res, next));
    router.get('/id/:id', async (req, res, next) => controller.getTank(req, res, next));
    router.get('/monitoring', async (req, res, next) => controller.getTankMonitoring(req, res, next));
    // POST
    router.post('/', validate(validator_1.TankValidator.createTank), auth_1.requireAuthentication, async (req, res, next) => controller.createTank(req, res, next));
    // PUT
    router.patch('/id/:id', validate(validator_1.TankValidator.updateTank), auth_1.requireAuthentication, async (req, res, next) => controller.updateTank(req, res, next));
    // DELETE
    router.delete('/id/:id', auth_1.requireAuthentication, async (req, res, next) => controller.deleteTank(req, res, next));
    router.use('*', (req, res) => res.status(400).send(boom_1.default.badRequest(`${req.originalUrl} doesn't exist`)));
    return router;
}
exports.routes = routes;
//# sourceMappingURL=routes.js.map