"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
let config = {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
};
if (process.env.NODE_ENV === 'test') {
    config = Object.assign({}, config, { user: process.env.TEST_PG_USER, database: process.env.TEST_PG_DATABASE, password: process.env.TEST_PG_PASSWORD, port: process.env.TEST_PG_PORT, host: process.env.TEST_PG_HOST });
}
// DATABASE_URL is defined by heroku
if (process.env.NODE_ENV === 'production') {
    config.connectionString = process.env.DATABASE_URL;
}
exports.pool = new pg_1.Pool(config);
//# sourceMappingURL=db.js.map