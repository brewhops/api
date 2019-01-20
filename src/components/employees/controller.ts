import { PostgresController, IPostgresController } from '../../dal/postgres';
import { Request, Response, RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import Boom from 'boom';
import { generateAuthToken } from '../../middleware/auth';
import { userMatchAuthToken } from '../../util/auth';

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
      await this.connect();
      const { rows } = await this.read(safeUserData, '$1', [true]);
      res.status(200).json(rows);
      await this.disconnect();
    } catch (err) {
      res.json(Boom.badImplementation(err));
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
      await this.connect();
      const { rows } = await this.readById(req.params.id);
      res.status(200).json(rows);
      await this.disconnect();
    } catch(err) {
      res.json(Boom.badRequest(err));
    }
  }

  /**
   * Creates a new employee.
   * @param {Request} req
   * @param {Response} res
   * @memberof EmployeeController
   */
  async createEmployee(req: Request, res: Response) {
    const { username, password: pw } = req.body;
    try {
      await this.connect();
      const prevUser = await this.readByUsername(username);
      const password = bcrypt.hashSync(pw, saltRounds);
      const { keys, values, escapes } = this.splitObjectKeyVals({...req.body, password});

      if (prevUser.rows.length !== 0) {
        res.json(Boom.badRequest('Username already taken'));
      } else {
        const { rows } = await this.create(keys, escapes, values, safeUserData);
        const returnedUser = rows[0];
        returnedUser.token = await generateAuthToken(returnedUser.username);
        res.status(201).json(rows[0]);
      }
    } catch (err) {
      res.json(Boom.badImplementation(err));
    }
    await this.disconnect();
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
      await this.connect();
      const prevUser = await this.readByUsername(username);
      if (prevUser.rows.length === 0) {
        res.json(Boom.unauthorized('Not authorized'));
      } else {
        const userID = prevUser.rows[0].id;
        const match = bcrypt.compareSync(password, prevUser.rows[0].password);
        if (match) {
          const token = await generateAuthToken(req.body.username);
          res.status(200).json({
            token,
            userID
          });
        } else {
          res.json(Boom.badRequest('Incorrect password'));
        }
      }
    } catch (err) {
      res.json(Boom.badImplementation(err));
    }
    await this.disconnect();
  }

  /**
   * Updates an employee's information.
   * @param {Request} req
   * @param {Response} res
   * @memberof EmployeeController
   */
  async updateEmployee(req: Request, res: Response) {
    try {
      await this.connect();
      const { keys, values } = this.splitObjectKeyVals(req.body);
      const { query, idx } = this.buildUpdateString(keys);
      values.push(req.params.id); // add last escaped value for where clause
      const { rows } = await this.readById(req.params.id);
      if (rows.length === 0 || !userMatchAuthToken(req.user, rows[0].username)) {
        res.json(Boom.badRequest('Not Authorized'));
      } else {
        const results = await this.update(query, `id = \$${idx}`, values); // eslint-disable-line
        res.json(results.rows);
      }
    } catch (err) {
      res.json(Boom.badImplementation(err));
    }
    await this.disconnect();
  }

  /**
   * Removes an employee from the database.
   * @param {Request} req
   * @param {Response} res
   * @memberof EmployeeController
   */
  async deleteEmployee(req: Request, res: Response) {
    try {
      await this.connect();
      const { rows } = await this.readById(req.params.id);
      if (rows.length === 0 || !userMatchAuthToken(req.user, rows[0].username)) {
        res.json(Boom.badRequest('Not Authorized'));
      } else {
        const results = await this.deleteById(req.params.id);
        res.json(results.rows);
      }
    } catch (err) {
      res.json(Boom.badImplementation(err));
    }
    await this.disconnect();
  }
}
