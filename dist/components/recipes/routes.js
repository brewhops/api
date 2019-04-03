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
    const controller = new controller_1.RecipeController('recipes');
    const router = express_1.Router();
    // tslint:disable-next-line:no-void-expression
    router.use((req, res, next) => next()); // init
    // [GET] section
    router.get('/', async (req, res, next) => controller.getRecipes(req, res, next));
    router.get('/id/:id', async (req, res, next) => controller.getRecipe(req, res, next));
    // [POST] section
    router.post('/', validate(validator_1.RecipeValidator.createRecipe), auth_1.requireAuthentication, async (req, res, next) => controller.createRecipe(req, res, next));
    // [PATCH] section
    router.patch('/id/:id', validate(validator_1.RecipeValidator.updateRecipe), auth_1.requireAuthentication, async (req, res, next) => controller.updateRecipe(req, res, next));
    // [DELETE] section
    router.delete('/id/:id', auth_1.requireAuthentication, async (req, res, next) => controller.deleteRecipe(req, res, next));
    router.use('*', (req, res) => res.status(400).send(boom_1.default.badRequest(`${req.originalUrl} doesn't exist`)));
    return router;
}
exports.routes = routes;
//# sourceMappingURL=routes.js.map