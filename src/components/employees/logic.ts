import {Pg} from './../../postgres/pg';
import {Request, Response} from 'express';
import bcrypt from 'bcrypt';
import Boom from 'boom';
import { generateAuthToken } from './../../middleware/auth';
import { userMatchAuthToken } from '../../util/auth';

const saltRounds = 8;

const safeUserData = `id, first_name, last_name, username, phone, admin`;

// tslint:disable:no-any no-unsafe-any

/**
 * Class that defined the logic for the 'user' route
 * @export
 * @class UserLogic
 * @extends {Pg}
 */
export class UserLogic extends Pg {
  constructor(tableName: string) {
    super(tableName);
  }

  // GET
  async getUsers(req: Request, res: Response) {
    const { rows } = await this.read(safeUserData);
    res.json(rows);
  }

  async getUser(req: Request, res: Response) {
    const { rows } = await this.readById(req.params.id);
    res.json(rows);
  }

  // POST
  async createUser(req: Request, res: Response) {
    const prevUser = await this.readByUsername(req.body.username);
    req.body.password = bcrypt.hashSync(req.body.password, saltRounds);
    const { keys, values, escapes } = this.splitObjectKeyVals(req.body);

    if (prevUser.rows.length !== 0) {
      res.status(400).json(Boom.badRequest('Username already taken'));
    } else {
      const { rows } = await this.create(keys, escapes, values, safeUserData);
      const returnedUser = rows[0];
      returnedUser.token = await generateAuthToken(returnedUser.username);
      res.status(201).json(rows[0]);
    }
  }

  async login(req: Request, res: Response) {
    const prevUser = await this.readByUsername(req.body.username);
    if (prevUser.rows.length === 0) {
      res.status(401).json(Boom.badRequest('Not authorized'));
    } else {
      const userID = prevUser.rows[0].id;
      const password = bcrypt.compareSync(req.body.password, prevUser.rows[0].password);
      if (password) {
        const token = await generateAuthToken(req.body.username);
        res.json({
          token,
          userID
        });
      } else {
        res.json(Boom.badRequest('Incorrect password'));
      }
    }
  }

  // PATCH/PUT
  async updateUser(req: Request, res: Response) {
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
  }

  // DELETE
  async deleteUser(req: Request, res: Response) {
    const { rows } = await this.readById(req.params.id);
    if (rows.length === 0 || !userMatchAuthToken(req.user, rows[0].username)) {
      res.json(Boom.badRequest('Not Authorized'));
    } else {
      const results = await this.deleteById(req.params.id);
      res.json(results.rows);
    }
  }
}
