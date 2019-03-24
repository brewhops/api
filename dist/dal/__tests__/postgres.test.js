"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const postgres_1 = require("../postgres");
describe('PostgresController', () => {
    let collName;
    let controller;
    const keys = 'keys';
    const values = 'values';
    const escapes = 'escapes';
    const keyValueResult = {
        keys: [keys, values, escapes],
        values: [keys, values, escapes],
        escapes: ['$1', '$2', '$3']
    };
    beforeAll(() => {
        collName = 'test';
        controller = new postgres_1.PostgresController(collName);
    });
    beforeEach(() => {
        controller = new postgres_1.PostgresController(collName);
    });
    it('splitObjectKeyVals', () => {
        const obj = { keys, values, escapes };
        const result = controller.splitObjectKeyVals(obj);
        expect(result).toEqual(keyValueResult);
    });
    it('buildQueryByID', () => {
        expect(controller.buildQueryByID(keys, values)).toEqual(`${keys} = ${values}`);
    });
    it('buildUpdateString', () => {
        expect(controller.buildUpdateString([keys, values, escapes])).toEqual({
            query: `${keys} = $1, ${values} = $2, ${escapes} = $3`,
            idx: 4
        });
    });
});
//# sourceMappingURL=postgres.test.js.map