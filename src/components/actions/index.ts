import bodyParser from "body-parser";
import e from "express";
import { routes } from "./routes";

// tslint:disable-next-line: no-var-requires
const cors = require("cors");

const lambda = e();

lambda.use(bodyParser.json());
lambda.use(cors());

lambda.use("/actions", routes());

export default lambda.listen(process.env.PORT);
