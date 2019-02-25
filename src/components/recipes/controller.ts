import { PostgresController, IPostgresController } from '../../dal/postgres';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import Boom from 'boom';
import is from 'is';

// tslint:disable:no-floating-promises no-any no-unsafe-any

export interface IRecipeController extends IPostgresController {
  getRecipes: RequestHandler;
  getRecipe: RequestHandler;
  createRecipe: RequestHandler;
  updateRecipe: RequestHandler;
  deleteRecipe: RequestHandler;
}

/**
 * Controller class for the recipes routes
 * @export
 * @class RecipeController
 * @extends {PostgresController}
 * @implements {IRecipeController}
 */
export class RecipeController extends PostgresController implements IRecipeController {
  constructor(tableName: string) {
    super(tableName);
  }

  /**
   * Returns an array of all recipes.
   * @param {Request} req
   * @param {Response} res
   * @memberof RecipeController
   */
  async getRecipes(req: Request, res: Response) {
    try {
      const { rows } = await this.read('*', '$1', [true]);
      res.status(200).json(rows);
    } catch (err) {
      res.status(500).send(Boom.badImplementation(err));
    }
  }

  /**
   * Returns a single recipe by id.
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof RecipeController
   */
  async getRecipe(req: Request, res: Response, next: NextFunction) {
    try {
      const { rows } = await this.readById(req.params.id);
      if (rows.length > 0) {
        res.status(200).json(rows[0]);
      } else {
        next();
      }
    } catch (err) {
      res.status(500).send(Boom.badImplementation(err));
    }
  }

  /**
   * Creates a new recipe
   * @param {Request} req
   * @param {Response} res
   * @memberof RecipeController
   */
  async createRecipe(req: Request, res: Response) {
    const { keys, values, escapes } = this.splitObjectKeyVals(req.body);
    try {
      const { rows } = await this.create(keys, escapes, values);
      res.status(201).json(rows[0]);
    } catch (err) {
      res.status(500).send(Boom.badImplementation(err));
    }
  }

  /**
   * Updates an existing recipe
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof RecipeController
   */
  async updateRecipe(req: Request, res: Response, next: NextFunction) {
    if (is.empty(req.body)) {
      res.status(400).send(Boom.badRequest('Request does not match valid form'));
    } else {
      const { keys, values } = this.splitObjectKeyVals(req.body);
      const { query, idx } = this.buildUpdateString(keys);
      values.push(req.params.id); // add last escaped value for where clause

      try {
        const { rows } = await this.update(query, `id = \$${idx}`, values); // eslint-disable-line
        if (rows.length > 0) {
          res.status(200).json(rows[0]);
        } else {
          next();
        }
      } catch (err) {
        res.status(500).send(Boom.badImplementation(err));
      }
    }
  }

  /**
   * Delets a recipe
   * @param {Request} req
   * @param {Response} res
   * @param {NextFunction} next
   * @memberof RecipeController
   */
  async deleteRecipe(req: Request, res: Response, next: NextFunction) {
    const { id } = req.params;
    try {
      const response = await this.deleteById(id);
      if (response.rowCount > 0) {
        res.status(200).json(`Successfully deleted recipe (id=${id})`);
      } else {
        next();
      }
    } catch (err) {
      res.status(500).send(Boom.badImplementation(err));
    }
  }
}
