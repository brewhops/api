import bodyParser from "body-parser";
import Boom from "boom";
import dotenv from "dotenv";
import e, { NextFunction, Request, Response } from "express";
import morgan from "morgan";
import { routes as ActionsRoutes } from "./components/actions/routes";
import { routes as BatchesRoutes } from "./components/batches/routes";
import { routes as EmployeesRoutes } from "./components/employees/routes";
import { routes as RecipesRoutes } from "./components/recipes/routes";
import { routes as TanksRoutes } from "./components/tanks/routes";
import { routes as TasksRoutes } from "./components/tasks/routes";
import { routes as VersionsRoutes } from "./components/versions/routes";
import { insertDevelopmentData } from "./utils/initial_data";

// tslint:disable:no-any no-unsafe-any
dotenv.config();

// tslint:disable-next-line:no-var-requires no-require-imports
const cors = require("cors");

const app = e();

app.use(bodyParser.json());
app.use(cors());
app.use(morgan("combined"));

app.use(
  (err: Error, req: Request, res: Response, next: NextFunction) => res.status(400).send(Boom.badRequest(err.message)),
);

// Only expose these routes in development
if (process.env.IS_NOW === "false") {
  app.use("/employees", EmployeesRoutes());
  app.use("/tanks", TanksRoutes());
  app.use("/actions", ActionsRoutes());
  app.use("/recipes", RecipesRoutes());
  app.use("/batches", BatchesRoutes());
  app.use("/tasks", TasksRoutes());
  app.use("/versions", VersionsRoutes());
  app.post("/init", async (req: Request, res: Response) => {
    try {
      await insertDevelopmentData(false);
      res.status(200).send("success");
    } catch (error) {
      res.status(500).send(Boom.badImplementation("failed"));
    }
  });

  app.post("/init-live", async (req: Request, res: Response) => {
    try {
      await insertDevelopmentData(true);
      res.status(200).send("success");
    } catch (error) {
      res.status(500).send(Boom.badImplementation("failed"));
    }
  });
}

app.get("/healthcheck", async (req: Request, res: Response) => {
  res.status(200).send(`hello world! from root route. NODE_ENV=${process.env.NODE_ENV}`);
});

app.use(
  (err: Error, req: Request, res: Response, next: NextFunction) => res.status(400).send(Boom.badRequest(err.message)),
);

export default app.listen(process.env.PORT, async () => {
    if (process.env.NODE_ENV === "production") {
      await insertDevelopmentData(true);
    }
    // tslint:disable-next-line:no-console
    console.log(`Server running at port ${process.env.PORT}`);
  });
