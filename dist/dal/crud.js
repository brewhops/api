"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
/**
 * The class that defines methods for performing CRUD operations against the db.
 * Requires an active connection to the db before performing operations.
 * Requires closing the db on operation completion.
 * @export
 * @class CrudController
 * @implements {ICrudController}
 */
class CrudController {
    constructor(tableName) {
        this.table = tableName;
    }
    /**
     * Returns the table name
     * @returns {string}
     * @memberof CrudController
     */
    tableName() {
        return this.table;
    }
    /**
     * This function is used to connect to the database.
     * It must be called before performing any operation.
     * @returns {Promise<void>}
     * @memberof CrudController
     */
    async connect() {
        // if we are testing the app, connect to the test db
        const config = {
            user: process.env.USER,
            database: process.env.DATABASE,
            password: process.env.PASSWORD,
            port: process.env.PORT,
            host: process.env.HOST
        };
        // tslint:disable-next-line
        console.log(config);
        if (process.env.NODE_ENV === 'production') {
            this.client = new pg_1.Client(config);
        }
        else {
            // connect to the prod db
            this.client = new pg_1.Client();
        }
        return this.client.connect();
    }
    /**
     * Ends the database conneciton
     * @returns {Promise<void>}
     * @memberof CrudController
     */
    async disconnect() {
        return this.client.end();
    }
    /**
     * Function to insert values into any column in the current table of the database
     * that returns what has been inserted.
     * @param {*} columns
     * @param {*} conditions
     * @param {any[]} escaped
     * @param {string} [returns='*']
     * @returns {Promise<QueryResult>}
     * @memberof CrudController
     */
    async create(columns, conditions, escaped, returns = '*') {
        return this.client.query(`INSERT INTO ${this.table} (${columns}) VALUES (${conditions}) RETURNING ${returns}`, escaped);
    }
    /**
     * Function to insert values into any column in a specified table of the database
     * NOT TESTED IN PG
     * @param {*} columns
     * @param {*} table
     * @param {*} conditions
     * @param {any[]} escaped
     * @returns {Promise<QueryResult>}
     * @memberof CrudController
     */
    async createInTable(columns, table, conditions, escaped) {
        return this.client.query(`INSERT INTO ${table} (${columns}) VALUES (${conditions}) RETURNING *`, escaped);
    }
    /**
     * Selects all specified columns from the current table in the database where the conditions are met.
     * @param {string} [columns=`*`]
     * @param {string} [conditions='true']
     * @param {any[]} [escaped=['']]
     * @returns {Promise<QueryResult>}
     * @memberof CrudController
     */
    async read(columns = `*`, conditions = 'true', escaped = ['']) {
        // tslint:disable-next-line: no-unnecessary-local-variable
        return this.client.query(`SELECT ${columns} FROM ${this.table} WHERE (${conditions})`, escaped);
    }
    /**
     * Not currently used?
     * @param {*} escaped
     * @returns {Promise<QueryResult>}
     * @memberof CrudController
     */
    async readById(escaped) {
        return this.client.query(`SELECT * FROM ${this.table} WHERE id = $1`, [escaped]);
    }
    /**
     * Not currently used?
     * @param {*} username
     * @returns {Promise<QueryResult>}
     * @memberof CrudController
     */
    async readByUsername(username) {
        return this.client.query(`SELECT * FROM ${this.table} WHERE username = $1`, [username]);
    }
    /**
     * Selects all specified columns from a specified table in the database where the conditions are met.
     * NOT TESTED IN PG
     * @param {*} [columns=`*`]
     * @param {*} [table=`${this.table}`]
     * @param {*} [conditions='']
     * @param {any[]} escaped
     * @returns {Promise<QueryResult>}
     * @memberof CrudController
     */
    async readInTable(columns = `*`, table = `${this.table}`, conditions = '', escaped) {
        return this.client.query(`Select ${columns} FROM ${table} WHERE ${conditions}`, escaped);
    }
    /**
     * Updates all columns in a specified table in the database where the conditions are met.
     * @param {*} columns
     * @param {*} conditions
     * @param {any[]} escaped
     * @returns {Promise<QueryResult>}
     * @memberof CrudController
     */
    async update(columns, conditions, escaped) {
        return this.client.query(`UPDATE ${this.table} SET ${columns} WHERE ${conditions} RETURNING *`, escaped);
    }
    /**
     * Updates all columns in a specified table in the database where the conditions are met.
     * @param {*} columns
     * @param {*} table
     * @param {*} conditions
     * @param {any[]} escaped
     * @returns {Promise<QueryResult>}
     * @memberof CrudController
     */
    async updateInTable(columns, table, conditions, escaped) {
        return this.client.query(`UPDATE ${table} SET ${columns} WHERE ${conditions} RETURNING *`, escaped);
    }
    // tslint:disable:no-reserved-keywords
    /**
     * Deletes all entries from the current table where the conditions are met.
     * @param {*} conditions
     * @param {any[]} escaped
     * @returns {Promise<QueryResult>}
     * @memberof CrudController
     */
    async delete(conditions, escaped) {
        return this.client.query(`DELETE FROM ${this.table} WHERE ${conditions}`, escaped);
    }
    // tslint:enable:no-reserved-keywords
    /**
     * Deletes entries from the current table by id.
     * @param {any[]} escaped
     * @returns {Promise<QueryResult>}
     * @memberof CrudController
     */
    async deleteById(escaped) {
        return this.client.query(`DELETE FROM ${this.table} WHERE id = $1`, [escaped]);
    }
    /**
     * Deletes all entries from a specified table in the database where the conditions are met.
     * NOT TESTED IN PG
     * @param {*} table
     * @param {*} conditions
     * @param {any[]} escaped
     * @returns {Promise<QueryResult>}
     * @memberof CrudController
     */
    async deleteInTable(table, conditions, escaped) {
        return this.client.query(`DELETE FROM ${table} WHERE ${conditions}`, escaped);
    }
}
exports.CrudController = CrudController;
//# sourceMappingURL=crud.js.map