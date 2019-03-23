"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = require("../controller");
describe('VersionController ', () => {
    let tableName;
    let controller;
    // tslint:disable:no-any no-unsafe-any
    let request = {};
    let response = {};
    let nextFunction = {};
    beforeAll(() => {
        tableName = 'versions';
        controller = new controller_1.VersionController(tableName);
        request = {
            params: {
                batchId: '1'
            }
        };
        response = {
            status: jest.fn().mockImplementation(() => ({
                json: jest.fn(),
                send: jest.fn()
            }))
        };
        nextFunction = jest.fn();
    });
    it('getVersionsByBatch success', async () => {
        const rows = ['TEST'];
        controller.pool.query = jest.fn().mockResolvedValue({ rows });
        await controller.getVersionsByBatch(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(200);
    });
    it('getVersionsByBatch error', async () => {
        controller.pool.query = jest.fn().mockRejectedValue(new Error());
        await controller.getVersionsByBatch(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(500);
    });
});
//# sourceMappingURL=controller.test.js.map