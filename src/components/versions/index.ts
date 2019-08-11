import e from "express";
import { routes } from "./routes";

const lambda = e();

lambda.use("/versions", routes());

export default lambda.listen(process.env.PORT);
