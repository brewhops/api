import { CrudController, ICrudController } from './crud';

// tslint:disable:no-any no-unsafe-any
export interface IPostgresController extends ICrudController {
  splitObjectKeyVals: (obj: any) => any;
  buildQueryByID: (key: string, value: string) => string;
  buildUpdateString: (keys: any) => any;
}

export type KeyValueResult = {
  keys: string[];
  values: string[];
  escapes: string[];
};

/**
 * A further extension of the CrudController class for some reason. Stay tuned...
 * @export
 * @class PostgresController
 * @extends {CrudController}
 */
export class PostgresController extends CrudController implements IPostgresController {
  private url: string;

  constructor(collName: string) {
    super(collName);
    // Production URL
    this.url = '';
  }

  /**
   * Separates keys and values into two arrays and includes escape charaters.
   * Returns an object containing all of this info.
   * @param {*} obj
   * @returns
   * @memberof PostgresController
   */
  splitObjectKeyVals(obj: { [index: string]: any }): KeyValueResult {
    const keys = [];
    const values = [];
    const escapes = [];
    let idx = 1;

    // tslint:disable-next-line: no-for-in forin
    for (const key in obj) {
      // we can;t use truthiness here because some of the values we insert must be 'false'
      if (obj[key] !== null && obj[key] !== undefined) {
        keys.push(key.toString());
        values.push(obj[key].toString());
        escapes.push(`\$${idx}`); // eslint-disable-line
        idx++;
      }
    }

    return {
      keys,
      values,
      escapes
    };
  }

  /**
   * NOTE: This only works for one query.
   * NOT compounded AND/OR only used to get stuff by ID.
   * @param {string} key
   * @param {string} value
   * @returns
   * @memberof PostgresController
   */
  buildQueryByID(key: string, value: string): string {
    return `${key} = ${value}`;
  }

  /**
   * Builds some sort of updates object out of a string
   * @param {string} keys
   * @param {*} values
   * @returns {*}
   * @memberof PostgresController
   */
  buildUpdateString(keys: string[]): any {
    let query = ``;
    let idx = 1;
    for (const key of keys) {
      query += `${key} = \$${idx}, `; // eslint-disable-line
      idx++;
    } // match keys to the current escape index '$1'

    query = query.substring(0, query.length - 2); // remove trailing ', '

    return {
      query,
      idx
    };
  }
}
