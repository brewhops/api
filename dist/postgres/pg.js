"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CRUD_1 = require("./CRUD");
/**
 * A further extension of the CrudController class for some reason. Stay tuned...
 * @export
 * @class Pg
 * @extends {CrudController}
 */
class Pg extends CRUD_1.CrudController {
    constructor(collName) {
        super(collName);
        // Production URL
        this.url = '';
    }
    /**
     * Separates keys and values into two arrays and includes escape charaters.
     * Returns an object containing all of this info.
     * @param {*} obj
     * @returns
     * @memberof Pg
     */
    splitObjectKeyVals(obj) {
        const keys = [];
        const values = [];
        const escapes = [];
        let idx = 1;
        // tslint:disable-next-line: no-for-in forin
        for (const key in obj) {
            keys.push(key.toString());
            values.push(obj[key].toString());
            escapes.push(`\$${idx}`); // eslint-disable-line
            idx++;
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
     * @memberof Pg
     */
    buildQueryByID(key, value) {
        return `${key} = ${value}`;
    }
    /**
     * Builds some sort of updates object out of a string
     * @param {string} keys
     * @param {*} values
     * @returns {*}
     * @memberof Pg
     */
    buildUpdateString(keys) {
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
exports.Pg = Pg;
//# sourceMappingURL=pg.js.map