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
 * Initializes the 'tasks' route handlers and returns an Express.Router
 * @export
 * @returns {Router}
 */
function routes() {
    const controller = new controller_1.TaskController('tasks');
    const router = express_1.Router();
    // tslint:disable-next-line: no-void-expression
    router.use((req, res, next) => next()); // init
    // [GET] section
    router.get('/', async (req, res, next) => controller.getTasks(req, res, next));
    router.get('/batch/:batchId', async (req, res, next) => controller.getTasksByBatch(req, res, next));
    // [POST] section
    router.post('/', async (req, res, next) => controller.createTask(req, res, next));
    // [PATCH] section
    router.patch('/', async (req, res, next) => controller.updateTask(req, res, next));
    router.use('*', (req, res) => res.status(400).send(boom_1.default.badRequest(`${req.originalUrl} doesn't exist`)));
    return router;
}
exports.routes = routes;
//# sourceMappingURL=routes.js.map