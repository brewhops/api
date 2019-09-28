import Boom from "boom";
import { NextFunction, Request, Response, Router } from "express";
import { IVersionController, VersionController } from "./controller";
import { requireAuthentication } from "../../middleware/auth";

// tslint:disable: no-unsafe-any

/**
 * Initializes the 'versions' route handlers and returns an Express.Router
 * @export
 * @returns {Router}
 */
export function routes(): Router {
  const controller: IVersionController = new VersionController("versions");
  const router: Router = Router();

  // tslint:disable-next-line: no-void-expression
  router.use((req: Request, res: Response, next: NextFunction) => next()); // init

  // [GET] section
  router.get("/batch/:batchId", async (req, res, next) => controller.getVersionsByBatch(req, res, next));

  // [PATCH] section
  router.patch("/id/:id", requireAuthentication, async (req, res, next) => controller.patchVersion(req, res, next));

  // [DELETE] section
  router.delete("/id/:id", requireAuthentication, async (req, res, next) => controller.deleteVersion(req, res, next));

  router.use(
    "*",
    (req: Request, res: Response) => res.status(404).send(Boom.badRequest(`${req.originalUrl} doesn't exist`)),
  );

  return router;
}
