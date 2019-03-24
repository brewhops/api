import { PostgresController, IPostgresController } from '../../dal/postgres';
import { Request, Response, RequestHandler } from 'express';
import CryptoJS from 'crypto-js';
import Boom from 'boom';
import { generateAuthToken } from '../../middleware/auth';
import { userMatchAuthToken } from '../../util/auth';
import is from 'is';

const saltRounds = 8;

const safeUserData = 'id, first_name, last_name, username, phone, admin';

// tslint:disable:no-any no-unsafe-any
export interface IEmployeeController extends IPostgresController {
  getEmployees: RequestHandler;
  getEmployee: RequestHandler;
  createEmployee: RequestHandler;
  login: RequestHandler;
  updateEmployee: RequestHandler;
  deleteEmployee: RequestHandler;
  verifyAdmin: RequestHandler;
  isAdmin: (id: string) => Promise<boolean>;
}


/**
 * Class that defined the logic for the 'user' route
 * @export
 * @class EmployeeController
 * @extends {PostgresController}
 * @implements {IEmployeeController}
 */
export class EmployeeController extends PostgresController implements IEmployeeController {
  constructor(tableName: string) {
    super(tableName);
  }

  /**
   * Returns an array of users
   * @param {Request} req
   * @param {Response} res
   * @memberof EmployeeController
   */
  async getEmployees(req: Request, res: Response) {
    try {
      const { rows } = await this.read(safeUserData, '$1', [true]);
      res.status(200).json(rows);
    } catch (err) {
      res.status(500).send(Boom.badImplementation(err));
    }
  }

  /**
   * Returns a user by id
   * @param {Request} req
   * @param {Response} res
   * @memberof EmployeeController
   */
  async getEmployee(req: Request, res: Response) {
    try {
      const { rows } = await this.readById(req.params.id);
      res.status(200).json(rows);
    } catch(err) {
      res.status(400).send(Boom.badRequest(err));
    }
  }

  /**
   * Creates a new employee.
   * @param {Request} req
   * @param {Response} res
   * @memberof EmployeeController
   */
  async createEmployee(req: Request, res: Response) {
    const { username, password } = req.body;
    try {
      const prevUser = await this.readByUsername(username);
      const { keys, values, escapes } = this.splitObjectKeyVals({...req.body, password});

      if (prevUser.rows.length !== 0) {
        res.status(400).send(Boom.badRequest('Username already taken'));
      } else {
        const { rows } = await this.create(keys, escapes, values, safeUserData);
        const returnedUser = rows[0];
        returnedUser.token = await generateAuthToken(returnedUser.username);
        res.status(201).json(rows[0]);
      }
    } catch (err) {
      res.status(500).send(Boom.badImplementation(err));
    }
  }

  /**
   * Verifies an employee in the database and returns an authentication token for that user.
   * @param {Request} req
   * @param {Response} res
   * @memberof EmployeeController
   */
  async login(req: Request, res: Response) {
    const { username, password } = req.body;
    try {
      const prevUser = await this.readByUsername(username);
      if (prevUser.rows.length === 0) {
        res.status(401).send(Boom.unauthorized('Not authorized'));
      } else {
        const id = prevUser.rows[0].id;
        const stored = prevUser.rows[0].password;
        // tslint:disable-next-line:possible-timing-attack
        const match = password === stored;
        if (match) {
          const token = await generateAuthToken(req.body.username);
          res.status(200).json({
            id,
            token
          });
        } else {
          res.status(400).send(Boom.badRequest('Incorrect password'));
        }
      }
    } catch (err) {
      res.status(500).send(Boom.badImplementation(err));
    }
  }

  /**
   * Updates an employee's information.
   * @param {Request} req
   * @param {Response} res
   * @memberof EmployeeController
   */
  async updateEmployee(req: Request, res: Response) {
    try {
      const { keys, values } = this.splitObjectKeyVals(req.body);
      const { query, idx } = this.buildUpdateString(keys);
      values.push(req.params.id); // add last escaped value for where clause
      const { rows } = await this.readById(req.params.id);

      if(rows.length > 0 ) {
        if(await this.isAdmin(req.user)) {
          const results = await this.update(query, `id = \$${idx}`, values); // eslint-disable-line
          res.status(200).json(`Deleted ${results.rowCount} user`);
        } else {
          res.status(401).send(Boom.unauthorized('Not authorized.'));
        }
      } else {
        res.status(500).send(Boom.badImplementation(`User down not exist`));
      }
    } catch (err) {
      res.status(500).send(Boom.badImplementation(err));
    }
  }

  /**
   * Removes an employee from the database.
   * @param {Request} req
   * @param {Response} res
   * @memberof EmployeeController
   */
  async deleteEmployee(req: Request, res: Response) {
    try {
      const { rows } = await this.readById(req.params.id);
      if(rows.length > 0 ) {
        if(await this.isAdmin(req.user) && !userMatchAuthToken(req.user, rows[0].username)) {
          const results = await this.deleteById(req.params.id);
          res.status(200).json(results.rows);
        } else {
          res.status(401).send(Boom.unauthorized('Not authorized.'));
        }
      } else {
        res.status(500).send(Boom.badImplementation(`User down not exist`));
      }
    } catch (err) {
      res.status(500).send(Boom.badImplementation(err));
    }
  }

  /**
   *
   *
   * @param {Request} req
   * @param {Response} res
   * @memberof EmployeeController
   */
  async verifyAdmin(req: Request, res: Response) {
    const { username } = req.params;
    try {
      const isAdmin = await this.isAdmin(username);
      res.status(200).json(isAdmin);
    } catch (err) {
      res.status(200).json(false);
    }
  }

  /**
   * Determines whether the current user is an administrator.
   * @param {string} username
   * @returns
   * @memberof EmployeeController
   */
  async isAdmin(username: string) {
    let isAdmin: boolean = false;
    try {
      const { rows } = await this.readByUsername(username);
      isAdmin = rows[0].admin;
    } catch (err) {
      throw err;
    }

    return isAdmin;
  }
}
