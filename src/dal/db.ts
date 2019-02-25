import { PoolConfig, Pool } from 'pg';

let config: PoolConfig = {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
};

if (process.env.NODE_ENV === 'test') {
    config = {
        ...config,
        user: process.env.TEST_PG_USER,
        database: process.env.TEST_PG_DATABASE,
        password: process.env.TEST_PG_PASSWORD,
        port: <number | undefined>process.env.TEST_PG_PORT,
        host: process.env.TEST_PG_HOST
    };
}

export const pool = new Pool(config);