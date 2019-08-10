import { PoolConfig, Pool } from 'pg';
import { cert, key, ca } from './certs';
import { decrypt } from '../utils/decrypt';

let config: PoolConfig = {
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 20000
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

// DATABASE_URL is defined by heroku
if (process.env.IS_NOW) {
    const { NODE_ENV } = process.env;
    if(NODE_ENV === 'production') {
        const { DB_USER: user, DB_NAME: database, DB_HOST: host, DB_PASSWORD: password, DB_PORT: port } = process.env;
        config = { ...config, user, database, password, host, port: <number | undefined>port };
    } else if (NODE_ENV === 'development') {
        const { DB_DEV_USER: user, DB_DEV_NAME: database, DB_DEV_HOST: host, DB_DEV_PASSWORD: password, DB_PORT: port } = process.env;
        config = { ...config, user, database, password, host, port: <number | undefined>port };
    }
    config.ssl = {
        ca: decrypt(ca),
        key: decrypt(key),
        cert: decrypt(cert),
        rejectUnauthorized: false
    };
}

export const pool = new Pool(config);