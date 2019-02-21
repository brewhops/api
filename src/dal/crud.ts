import { Client, ClientConfig, QueryResult } from 'pg';

// tslint:disable:no-any

/**
 * Defines the public facing functions needed to implement a CrudController object.
 * @export
 * @interface ICrudController
 */
export interface ICrudController {
  tableName: () => string;
  connect: () => Promise<void | Client>;
  disconnect: () => Promise<void>;
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
  public client!: Client;
  private table: string;

  constructor(tableName: string) {
    this.table = tableName;
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
   * This function is used to connect to the database.
   * It must be called before performing any operation.
   * @returns {Promise<void>}
   * @memberof CrudController
   */
  public async connect(returnClient?: boolean): Promise<void | Client> {
    let client;

    // if we are testing the app, connect to the test db
    const config: ClientConfig = {
      user: process.env.TEST_PG_USER,
      database: process.env.TEST_PG_DATABASE,
      password: process.env.TEST_PG_PASSWORD,
      port: <number | undefined>process.env.TEST_PG_PORT,
      host: process.env.TEST_PG_HOST
    };

    if (process.env.NODE_ENV === 'test') {
      client = new Client(config);
    } else {
      // connect to the prod db
      client = new Client();
    }

    await client.connect();

    if (!returnClient) {
      this.client = client;

      return;
    }

    return client;
  }

  /**
   * Ends the database conneciton
   * @returns {Promise<void>}
   * @memberof CrudController
   */
  public async disconnect(client?: Client): Promise<void> {
    if (!client) {
      return this.client.end();
    }

    return client.end();
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
  async create(columns: any, conditions: any, escaped: any[], returns = '*', client?: Client): Promise<QueryResult> {
    return (client || this.client).query(
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
    escaped: any[],
    client?: Client
  ): Promise<QueryResult> {
    return (client || this.client).query(`INSERT INTO ${table} (${columns}) VALUES (${conditions}) RETURNING *`, escaped);
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
    escaped: any[] = [''],
    client?: Client
  ): Promise<QueryResult> {
    // tslint:disable-next-line: no-unnecessary-local-variable
    return (client || this.client).query(`SELECT ${columns} FROM ${this.table} WHERE (${conditions})`, escaped);
  }

  /**
   * Not currently used?
   * @param {*} escaped
   * @returns {Promise<QueryResult>}
   * @memberof CrudController
   */
  async readById(escaped: any, client?: Client): Promise<QueryResult> {
    return (client || this.client).query(
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
  async readByUsername(username: string, client?: Client): Promise<QueryResult> {
    return (client || this.client).query(`SELECT * FROM ${this.table} WHERE username = $1`, [username]);
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
    escaped: any[],
    client?: Client
  ): Promise<QueryResult> {
    return (client || this.client).query(`Select ${columns} FROM ${table} WHERE ${conditions}`, escaped);
  }

  /**
   * Updates all columns in a specified table in the database where the conditions are met.
   * @param {*} columns
   * @param {*} conditions
   * @param {any[]} escaped
   * @returns {Promise<QueryResult>}
   * @memberof CrudController
   */
  async update(columns: any, conditions: any, escaped: any[], client?: Client): Promise<QueryResult> {
    return (client || this.client).query(
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
  async updateInTable(columns: any, table: any, conditions: any, escaped: any[], client?: Client): Promise<QueryResult> {
    return (client || this.client).query(
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
  async delete(conditions: any, escaped: any[], client?: Client): Promise<QueryResult> {
    return (client || this.client).query(`DELETE FROM ${this.table} WHERE ${conditions}`, escaped);
  }
  // tslint:enable:no-reserved-keywords

  /**
   * Deletes entries from the current table by id.
   * @param {any[]} escaped
   * @returns {Promise<QueryResult>}
   * @memberof CrudController
   */
  async deleteById(escaped: any[], client?: Client): Promise<QueryResult> {
    return (client || this.client).query(`DELETE FROM ${this.table} WHERE id = $1`, [escaped]);
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
  async deleteInTable(table: any, conditions: any, escaped: any[], client?: Client): Promise<QueryResult> {
    return (client || this.client).query(`DELETE FROM ${table} WHERE ${conditions}`, escaped);
  }
}
