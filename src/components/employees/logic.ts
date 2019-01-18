import { PostgresController, IPg } from '../../dal/postgres';
import { Request, Response, RequestHandler } from 'express';
import bcrypt from 'bcrypt';
import Boom from 'boom';
import { generateAuthToken } from './../../middleware/auth';
import { userMatchAuthToken } from '../../util/auth';

const saltRounds = 8;

const safeUserData = 'id, first_name, last_name, username, phone, admin';

// tslint:disable:no-any no-unsafe-any
interface IEmployeeController extends IPg {
  getUsers: RequestHandler;
  getUser: RequestHandler;
  createUser: RequestHandler;
  login: RequestHandler;
  updateUser: RequestHandler;
  deleteUser: RequestHandler;
}


/**
 * Class that defined the logic for the 'user' route
 * @export
 * @class UserLogic
 * @extends {PostgresController}
 */
export class EmployeeController extends PostgresController implements IEmployeeController {
  constructor(tableName: string) {
    super(tableName);
  }

  // GET
  async getUsers(req: Request, res: Response) {
    try {
      await this.connect();
      const { rows } = await this.read(safeUserData, '$1', [true]);
      res.status(200).json(rows);
      await this.disconnect();
    } catch (err) {
      res.json(Boom.badImplementation(err));
    }
  }

  async getUser(req: Request, res: Response) {
    try {
      await this.connect();
      const { rows } = await this.readById(req.params.id);
      res.status(200).json(rows);
      await this.disconnect();
    } catch(err) {
      res.json(Boom.badRequest(err));
    }
  }

  // POST
  async createUser(req: Request, res: Response) {
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

  // PATCH/PUT
  async updateUser(req: Request, res: Response) {
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

  // DELETE
  async deleteUser(req: Request, res: Response) {
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
