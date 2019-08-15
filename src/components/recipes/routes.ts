import Boom from "boom";
import e, { NextFunction, Request, Response, Router } from "express";
import { requireAuthentication } from "../../middleware/auth";
import { IRecipeController, RecipeController } from "./controller";
import { RecipeValidator } from "./validator";
// tslint:disable-next-line:no-var-requires no-require-imports
const validate = require("express-validation");

// tslint:disable:no-any no-unsafe-any

export function routes(): Router {
  const controller: IRecipeController = new RecipeController("recipes");
  const router: Router = Router();

  // tslint:disable-next-line:no-void-expression
  router.use((req: Request, res: Response, next: NextFunction) => next()); // init

  // [GET] section
  router.get("/", async (req, res, next) => controller.getRecipes(req, res, next));
  router.get("/id/:id", async (req, res, next) => controller.getRecipe(req, res, next));

  // [POST] section
  router.post("/",
  validate(RecipeValidator.createRecipe),
  requireAuthentication,
  async (req, res, next) => controller.createRecipe(req, res, next));

  // [PATCH] section
  router.patch("/id/:id",
  validate(RecipeValidator.updateRecipe),
  requireAuthentication,
  async (req, res, next) => controller.updateRecipe(req, res, next));

  // [DELETE] section
  router.delete("/id/:id", requireAuthentication, async (req, res, next) => controller.deleteRecipe(req, res, next));

  router.use("*", (req, res) => res.status(400).send(Boom.badRequest(`${req.originalUrl} doesn't exist`)));

  return router;
}
