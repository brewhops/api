"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const routes_1 = require("./components/employees/routes");
const routes_2 = require("./components/tanks/routes");
const routes_3 = require("./components/actions/routes");
const routes_4 = require("./components/recipes/routes");
const routes_5 = require("./components/batches/routes");
const routes_6 = require("./components/tasks/routes");
const routes_7 = require("./components/versions/routes");
const initial_data_1 = require("./util/initial_data");
const boom_1 = __importDefault(require("boom"));
// tslint:disable:no-any no-unsafe-any
dotenv_1.default.config();
// tslint:disable-next-line:no-var-requires no-require-imports
const cors = require('cors');
const app = express_1.default();
app.use(body_parser_1.default.json());
app.use(cors());
app.use((err, req, res, next) => res.status(400).send(boom_1.default.badRequest(err.message)));
app.use('/employees', routes_1.routes());
app.use('/tanks', routes_2.routes());
app.use('/actions', routes_3.routes());
app.use('/recipes', routes_4.routes());
app.use('/batches', routes_5.routes());
app.use('/tasks', routes_6.routes());
app.use('/versions', routes_7.routes());
if (process.env.NODE_ENV === 'development') {
    app.post('/init', async (req, res) => {
        try {
            await initial_data_1.insertDevelopmentData();
            res.status(200).send('success');
        }
        catch (error) {
            res.status(500).send(boom_1.default.badImplementation('failed'));
        }
    });
}
if (process.env.NODE_ENV !== 'test') {
    app.listen(process.env.PORT, () => {
        // tslint:disable-next-line:no-console
        console.log(`Server running at port ${process.env.PORT}`);
    });
}
//# sourceMappingURL=index.js.map