"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
const validator_1 = require("./validator");
const boom_1 = __importDefault(require("boom"));
const auth_1 = require("../../middleware/auth");
// tslint:disable-next-line:no-var-requires no-require-imports
const validate = require('express-validation');
// tslint:disable:no-any no-unsafe-any
function routes() {
    const controller = new controller_1.BatchesController('batches');
    const router = express_1.Router();
    // tslint:disable-next-line:no-void-expression
    router.use((req, res, next) => next());
    // [GET] section
    router.get('/', async (req, res, next) => controller.getBatches(req, res, next));
    router.get('/tank/:tankId', async (req, res, next) => controller.getBatchesByTank(req, res, next));
    router.get('/recipe/:recipeId', async (req, res, next) => controller.getBatchesByRecipe(req, res, next));
    router.get('/id/:id', async (req, res, next) => controller.getBatch(req, res, next));
    // [POST] section
    router.post('/new', validate(validator_1.BatchesValidator.createBatch), auth_1.requireAuthentication, async (req, res, next) => controller.createBatch(req, res, next));
    router.post('/update', validate(validator_1.BatchesValidator.updateBatch), auth_1.requireAuthentication, async (req, res, next) => controller.updateBatch(req, res, next));
    // [PATCH] section
    router.patch('/id/:id', auth_1.requireAuthentication, async (req, res, next) => controller.patchBatch(req, res, next));
    // [DELETE] section
    router.delete('/id/:id', auth_1.requireAuthentication, async (req, res, next) => controller.deleteBatch(req, res, next));
    router.delete('/close/:id', auth_1.requireAuthentication, async (req, res, next) => controller.closeBatch(req, res, next));
    router.use('*', (req, res) => res.status(404).send(boom_1.default.notFound(`The route ${req.originalUrl} does not exist`)));
    return router;
}
exports.routes = routes;
//# sourceMappingURL=routes.js.map