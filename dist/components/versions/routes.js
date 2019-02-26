"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const boom_1 = __importDefault(require("boom"));
// tslint:disable: no-unsafe-any
/**
 * Initializes the 'versions' route handlers and returns an Express.Router
 * @export
 * @returns {Router}
 */
function routes() {
    const controller = new controller_1.VersionController('versions');
    const router = express_1.Router();
    // tslint:disable-next-line: no-void-expression
    router.use((req, res, next) => next()); // init
    // [GET] section
    router.get('/batch/:batchId', async (req, res, next) => controller.getVersionsByBatch(req, res, next));
    router.use('*', (req, res) => res.status(400).send(boom_1.default.badRequest(`${req.originalUrl} doesn't exist`)));
    return router;
}
exports.routes = routes;
//# sourceMappingURL=routes.js.map