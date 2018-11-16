import { Client, ClientConfig, QueryResult } from 'pg';

// tslint:disable:no-any

/**
 * Defines the public facing functions needed to implement a Crud object.
 * @export
 * @interface ICrud
 */
export interface ICrud {
  tableName: () => string;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  create: (columns: any, conditions: any, escaped: any[]) => Promise<QueryResult>;
  createInTable: (
    columns: any,
    table: any,
    conditions: any,
    escaped: any[]
  ) => Promise<QueryResult>;
  read: (
    columns: string,
    conditions: string,
    escaped: any[]
  ) => Promise<QueryResult>;
  readById: (escaped: any) =>  Promise<QueryResult>;
  readByUsername: (username: any) => Promise<QueryResult>;
  readInTable: (
    columns: any,
    table: any,
    conditions: any,
    escaped: any[]
  ) => Promise<QueryResult>;
  update: (columns: any, conditions: any, escaped: any[]) => Promise<QueryResult>;
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
 * @class Crud
 * @implements {ICrud}
 */
export class Crud implements ICrud {
  private client!: Client;
  private table: string;

  constructor(tableName: string) {
    this.table = tableName;
  }

  /**
   * Returns the table name
   * @returns {string}
   * @memberof Crud
   */
  public tableName(): string {
    return this.table;
  }

  /**
   * This function is used to connect to the database.
   * It must be called before performing any operation.
   * @returns {Promise<void>}
   * @memberof Crud
   */
  public async connect(): Promise<void> {
    // if we are testing the app, connect to the test db
    const config: ClientConfig = {
      user: process.env.TEST_PG_USER,
      database: process.env.TEST_PG_DATABASE,
      password: process.env.TEST_PG_PASSWORD,
      port: <number | undefined>process.env.TEST_PG_PORT,
      host: process.env.TEST_PG_HOST
    };

    if (process.env.NODE_ENV === 'test') {
      this.client = new Client(config);
    } else {
      // connect to the prod db
      this.client = new Client();
    }

    return this.client.connect();
  }

  /**
   * Ends the database conneciton
   * @returns {Promise<void>}
   * @memberof Crud
   */
  public async disconnect(): Promise<void> {
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
   * @memberof Crud
   */
  async create(columns: any, conditions: any, escaped: any[], returns = '*'): Promise<QueryResult> {
    return this.client.query(
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
   * @memberof Crud
   */
  async createInTable(
    columns: any,
    table: any,
    conditions: any,
    escaped: any[]
  ): Promise<QueryResult> {
    return this.client.query(`INSERT INTO ${table} (${columns}) VALUES (${conditions})`, escaped);
  }

  /**
   * Selects all specified columns from the current table in the database where the conditions are met.
   * @param {string} [columns=`*`]
   * @param {string} [conditions='true']
   * @param {any[]} [escaped=['']]
   * @returns {Promise<QueryResult>}
   * @memberof Crud
   */
  async read(
    columns: string = `*`,
    conditions: string = 'true',
    escaped: any[] = ['']
  ): Promise<QueryResult> {
    return this.client.query(`SELECT ${columns} FROM ${this.table} WHERE (${conditions})`, escaped);
  }

  /**
   * Not currently used?
   * @param {*} escaped
   * @returns {Promise<QueryResult>}
   * @memberof Crud
   */
  async readById(escaped: any): Promise<QueryResult> {
    return this.client.query(`SELECT * FROM ${this.table} WHERE id = $1`, [escaped]);
  }

  /**
   * Not currently used?
   * @param {*} username
   * @returns {Promise<QueryResult>}
   * @memberof Crud
   */
  async readByUsername(username: any): Promise<QueryResult> {
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
   * @memberof Crud
   */
  async readInTable(
    columns: any = `*`,
    table: any = `${this.table}`,
    conditions: any = '',
    escaped: any[]
  ): Promise<QueryResult> {
    return this.client.query(`Select ${columns} FROM ${table} WHERE ${conditions}`, escaped);
  }

  /**
   * Updates all columns in a specified table in the database where the conditions are met.
   * @param {*} columns
   * @param {*} conditions
   * @param {any[]} escaped
   * @returns {Promise<QueryResult>}
   * @memberof Crud
   */
  async update(columns: any, conditions: any, escaped: any[]): Promise<QueryResult> {
    return this.client.query(
      `UPDATE ${this.table} SET ${columns} WHERE ${conditions} RETURNING *`,
      escaped
    );
  }

  // tslint:disable:no-reserved-keywords
  /**
   * Deletes all entries from the current table where the conditions are met.
   * @param {*} conditions
   * @param {any[]} escaped
   * @returns {Promise<QueryResult>}
   * @memberof Crud
   */
  async delete(conditions: any, escaped: any[]): Promise<QueryResult> {
    return this.client.query(`DELETE FROM ${this.table} WHERE ${conditions}`, escaped);
  }
  // tslint:enable:no-reserved-keywords

  /**
   * Deletes entries from the current table by id.
   * @param {any[]} escaped
   * @returns {Promise<QueryResult>}
   * @memberof Crud
   */
  async deleteById(escaped: any[]): Promise<QueryResult> {
    return this.client.query(`DELETE FROM ${this.table} WHERE id = $1`, [escaped]);
  }

  /**
   * Deletes all entries from a specified table in the database where the conditions are met.
   * NOT TESTED IN PG
   * @param {*} table
   * @param {*} conditions
   * @param {any[]} escaped
   * @returns {Promise<QueryResult>}
   * @memberof Crud
   */
  async deleteInTable(table: any, conditions: any, escaped: any[]): Promise<QueryResult> {
    return this.client.query(`DELETE FROM ${table} WHERE ${conditions}`, escaped);
  }
}
