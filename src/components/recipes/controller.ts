import { PostgresController } from '../../dal/postgres';
import { Request, Response, NextFunction } from 'express';
import Boom from 'boom';
import is from 'is';

// tslint:disable:no-floating-promises no-any no-unsafe-any

export interface IRecipeController {
  getRecipes: () => Promise<void>;
  getRecipe: () => Promise<void>;
  createRecipe: () => Promise<void>;
  updateRecipe: () => Promise<void>;
  deleteRecipe: () => Promise<void>;
}

/**
 * Logic for recipes
 * @export
 * @class RecipeController
 * @extends {PostgresController}
 */
export class RecipeController extends PostgresController {
  constructor(tableName: string) {
    super(tableName);
  }

  // GET
  async getRecipes(req: Request, res: Response) {
    try {
      await this.connect();
      const { rows } = await this.read();
      res.json(rows);
    } catch (err) {
      res.send(Boom.badImplementation(err));
    }
    await this.disconnect();
  }

  async getRecipe(req: Request, res: Response, next: NextFunction) {
    try {
      await this.connect();
      const { rows } = await this.readById(req.params.id);
      if (rows.length > 0) {
        res.json(rows[0]);
      } else {
        next();
      }
    } catch (err) {
      res.send(Boom.badImplementation(err));
    }
    await this.disconnect();
  }

  // POST
  async createRecipe(req: Request, res: Response) {
    const { keys, values, escapes } = this.splitObjectKeyVals(req.body);
    try {
      await this.connect();
      const { rows } = await this.create(keys, escapes, values);
      res.status(201).json(rows[0]);
    } catch (err) {
      res.send(Boom.badImplementation(err));
    }
  }

  // PATCH/PUT
  async updateRecipe(req: Request, res: Response, next: NextFunction) {
    if (is.empty(req.body)) {
      res.send(Boom.badRequest('Request does not match valid form'));
    } else {
      const { keys, values } = this.splitObjectKeyVals(req.body);
      const { query, idx } = this.buildUpdateString(keys);
      values.push(req.params.id); // add last escaped value for where clause

      try {
        await this.connect();
        const { rows } = await this.update(query, `id = \$${idx}`, values); // eslint-disable-line
        if (rows.length > 0) {
          res.json(rows[0]);
        } else {
          next();
        }
      } catch (err) {
        res.send(Boom.badImplementation(err));
      }
      await this.disconnect();
    }
  }

  // DELETE
  async deleteRecipe(req: Request, res: Response, next: NextFunction) {
    try {
      await this.connect();
      const response = await this.deleteById(req.params.id);
      if (response.rowCount > 0) {
        res.status(200).json();
      } else {
        next();
      }
    } catch (e) {
      res.send(Boom.badImplementation(e));
    }
    await this.disconnect();
  }
}
