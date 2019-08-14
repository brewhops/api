import Boom from "boom";
import { NextFunction, Request, Response, Router } from "express";
import { requireAuthentication } from "./../../middleware/auth";
import { EmployeeController, IEmployeeController } from "./controller";
import { EmployeeValidator } from "./validator";

// tslint:disable:no-any no-unsafe-any

// tslint:disable-next-line:no-var-requires no-require-imports
const validate = require("express-validation");

export function routes(): Router {
  const controller: IEmployeeController = new EmployeeController("employees");
  const router: Router = Router();

  // tslint:disable-next-line:no-void-expression
  router.use((req: Request, res: Response, next: NextFunction) => next()); // init

  // TODO: Remove this endpoint, it is just a production test
  router.get("/test", async (req: Request, res: Response) => {
    res.status(200).send(`hello world! from employees route. NODE_ENV=${process.env.NODE_ENV}`);
  });

  // [GET] section
  router.get("/", async (req, res, next) => controller.getEmployees(req, res, next));
  router.get("/admin/:username", async (req, res, next) => controller.verifyAdmin(req, res, next));
  router.get("/id/:id", requireAuthentication, async (req, res, next) => controller.getEmployee(req, res, next));

  // [POST] section
  router.post("/",
  validate(EmployeeValidator.createEmployee),
   requireAuthentication,
   async (req, res, next) => controller.createEmployee(req, res, next));
  router.post("/login", validate(EmployeeValidator.login), async (req, res, next) => controller.login(req, res, next));

  // [PATCH] section
  router.patch(
    "/id/:id",
    validate(EmployeeValidator.updateEmployee),
    requireAuthentication,
    async (req, res, next) => controller.updateEmployee(req, res, next),
  );

  // [DELETE] section
  router.delete("/id/:id", requireAuthentication, async (req, res, next) => controller.deleteEmployee(req, res, next));

  router.use("*", (req, res) => res.status(400).send(Boom.badRequest(`${req.originalUrl} doesn't exist`)));

  return router;
}
