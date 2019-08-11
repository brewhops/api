import e from "express";
import { routes } from "./routes";

const lambda = e();

lambda.use("/employees", routes());

export default lambda.listen(process.env.PORT);
