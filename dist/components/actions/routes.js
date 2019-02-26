"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const boom_1 = __importDefault(require("boom"));
const validator_1 = require("./validator");
const auth_1 = require("../../middleware/auth");
// tslint:disable-next-line:no-var-requires no-require-imports
const validate = require('express-validation');
// tslint:disable: no-unsafe-any
/**
 * Initializes the 'actions' route handlers and returns an Express.Router
 * @export
 * @returns {Router}
 */
function routes() {
    const controller = new controller_1.ActionController('actions');
    const router = express_1.Router();
    // tslint:disable-next-line: no-void-expression
    router.use((req, res, next) => next()); // init
    // [GET] section
    router.get('/', async (req, res, next) => controller.getActions(req, res, next));
    router.get('/id/:id', async (req, res, next) => controller.getAction(req, res, next));
    // [POST] section
    router.post('/', validate(validator_1.ActionValidator.createAction), auth_1.requireAuthentication, async (req, res, next) => controller.createAction(req, res, next));
    // [PATCH] section
    router.patch('/id/:id', validate(validator_1.ActionValidator.updateAction), auth_1.requireAuthentication, async (req, res, next) => controller.updateAction(req, res, next));
    // [DELETE] section
    router.delete('/id/:id', auth_1.requireAuthentication, async (req, res, next) => controller.deleteAction(req, res, next));
    router.use('*', (req, res) => res.status(400).send(boom_1.default.badRequest(`${req.originalUrl} doesn't exist`)));
    return router;
}
exports.routes = routes;
//# sourceMappingURL=routes.js.map