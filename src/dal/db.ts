import { Pool, PoolConfig } from "pg";

let config: PoolConfig = {
    connectionTimeoutMillis: 20000,
    idleTimeoutMillis: 30000,
    max: 20,
};

if (process.env.NODE_ENV === "test") {
    config = {
        ...config,
        database: process.env.TEST_PG_DATABASE,
        host: process.env.TEST_PG_HOST,
        password: process.env.TEST_PG_PASSWORD,
        port: process.env.TEST_PG_PORT as number | undefined,
        user: process.env.TEST_PG_USER,
    };
}

if (process.env.IS_NOW) {
    const { NODE_ENV } = process.env;
    // if (NODE_ENV === "production") {
    //     const {
    //         DB_USER: user,
    //         DB_NAME: database,
    //         DB_HOST: host,
    //         DB_PASSWORD: password,
    //         DB_PORT: port,
    //     } = process.env;
    //     config = { ...config, user, database, password, host, port: port as number | undefined };
    // } else if (NODE_ENV === "staging") {
    const {
            DB_STAGING_USER: user,
            DB_STAGING_NAME: database,
            DB_STAGING_HOST: host,
            DB_STAGING_PASSWORD: password,
            DB_STAGING_PORT: port,
        } = process.env;
    config = { ...config, user, database, password, host, port: port as number | undefined };
    // }
}

export const pool = new Pool(config);
