import e from "express";
import { routes } from "./routes";

const lambda = e();

lambda.use("/recipes", routes());

export default lambda.listen(process.env.PORT);
