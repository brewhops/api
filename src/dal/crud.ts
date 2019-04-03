import { QueryResult, Pool } from 'pg';
import { pool } from './db';

// tslint:disable:no-any

/**
 * Defines the public facing functions needed to implement a CrudController object.
 * @export
 * @interface ICrudController
 */
export interface ICrudController {
  pool: Pool;
  tableName: () => string;
  create: (columns: any, conditions: any, escaped: any[]) => Promise<QueryResult>;
  createInTable: (
    columns: any,
    table: any,
    conditions: any,
    escaped: any[]
  ) => Promise<QueryResult>;
  read: (columns: string, conditions: string, escaped: any[]) => Promise<QueryResult>;
  readById: (escaped: any) => Promise<QueryResult>;
  readByUsername: (username: any) => Promise<QueryResult>;
  readInTable: (columns: any, table: any, conditions: any, escaped: any[]) => Promise<QueryResult>;
  update: (columns: any, conditions: any, escaped: any[]) => Promise<QueryResult>;
  updateInTable: (columns: any, table: any, conditions: any, escaped: any[]) => Promise<QueryResult>;
  // tslint:disable-next-line:no-reserved-keywords
  delete: (conditions: any, escaped: any[]) => Promise<QueryResult>;
  deleteById: (escaped: any[]) => Promise<QueryResult>;
  deleteInTable: (table: any, conditions: any, escaped: any[]) => Promise<QueryResult>;
}

/**
 * The class that defines methods for performing CRUD operations against the db.
 * Requires an active connection to the db before performing operations.
 * Requires closing the db on operation completion.
 * @export
 * @class CrudController
 * @implements {ICrudController}
 */
export class CrudController implements ICrudController {
  public pool: Pool;
  private table: string;

  constructor(tableName: string) {
    this.table = tableName;
    this.pool = pool;
  }

  /**
   * Returns the table name
   * @returns {string}
   * @memberof CrudController
   */
  public tableName(): string {
    return this.table;
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
  async create(columns: any, conditions: any, escaped: any[], returns = '*'): Promise<QueryResult> {
    return this.pool.query(
      `INSERT INTO ${this.table} (${columns}) VALUES (${conditions}) RETURNING ${returns}`,
      escaped
    );
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
  async createInTable(
    columns: any,
    table: any,
    conditions: any,
    escaped: any[]
  ): Promise<QueryResult> {
    return this.pool.query(`INSERT INTO ${table} (${columns}) VALUES (${conditions}) RETURNING *`, escaped);
  }

  /**
   * Selects all specified columns from the current table in the database where the conditions are met.
   * @param {string} [columns=`*`]
   * @param {string} [conditions='true']
   * @param {any[]} [escaped=['']]
   * @returns {Promise<QueryResult>}
   * @memberof CrudController
   */
  async read(
    columns: string = `*`,
    conditions: string = 'true',
    escaped: any[] = ['']
  ): Promise<QueryResult> {
    // tslint:disable-next-line: no-unnecessary-local-variable
    return this.pool.query(`SELECT ${columns} FROM ${this.table} WHERE (${conditions})`, escaped);
  }

  /**
   * Not currently used?
   * @param {*} escaped
   * @returns {Promise<QueryResult>}
   * @memberof CrudController
   */
  async readById(escaped: any): Promise<QueryResult> {
    return this.pool.query(
      `SELECT * FROM ${this.table} WHERE id = $1`,
      [escaped]
    );
  }

  /**
   * Not currently used?
   * @param {*} username
   * @returns {Promise<QueryResult>}
   * @memberof CrudController
   */
  async readByUsername(username: string): Promise<QueryResult> {
    return this.pool.query(`SELECT * FROM ${this.table} WHERE username = $1`, [username]);
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
  async readInTable(
    columns: any = `*`,
    table: any = `${this.table}`,
    conditions: any = '',
    escaped: any[]
  ): Promise<QueryResult> {
    return this.pool.query(`Select ${columns} FROM ${table} WHERE ${conditions}`, escaped);
  }

  /**
   * Updates all columns in a specified table in the database where the conditions are met.
   * @param {*} columns
   * @param {*} conditions
   * @param {any[]} escaped
   * @returns {Promise<QueryResult>}
   * @memberof CrudController
   */
  async update(columns: any, conditions: any, escaped: any[]): Promise<QueryResult> {
    return this.pool.query(
      `UPDATE ${this.table} SET ${columns} WHERE ${conditions} RETURNING *`,
      escaped
    );
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
  async updateInTable(columns: any, table: any, conditions: any, escaped: any[]): Promise<QueryResult> {
    return this.pool.query(
      `UPDATE ${table} SET ${columns} WHERE ${conditions} RETURNING *`,
      escaped
    );
  }

  // tslint:disable:no-reserved-keywords
  /**
   * Deletes all entries from the current table where the conditions are met.
   * @param {*} conditions
   * @param {any[]} escaped
   * @returns {Promise<QueryResult>}
   * @memberof CrudController
   */
  async delete(conditions: any, escaped: any[]): Promise<QueryResult> {
    return this.pool.query(`DELETE FROM ${this.table} WHERE ${conditions}`, escaped);
  }
  // tslint:enable:no-reserved-keywords

  /**
   * Deletes entries from the current table by id.
   * @param {any[]} escaped
   * @returns {Promise<QueryResult>}
   * @memberof CrudController
   */
  async deleteById(escaped: any[]): Promise<QueryResult> {
    return this.pool.query(`DELETE FROM ${this.table} WHERE id = $1`, [escaped]);
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
  async deleteInTable(table: any, conditions: any, escaped: any[]): Promise<QueryResult> {
    return this.pool.query(`DELETE FROM ${table} WHERE ${conditions}`, escaped);
  }
}
