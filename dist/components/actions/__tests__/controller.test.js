"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = require("../controller");
// import * as request from 'supertest';
describe('ActionsController ', () => {
    let tableName;
    let controller;
    // tslint:disable:no-any no-unsafe-any
    const idx = 1;
    const query = 'query';
    const rows = ['TEST'];
    const keys = 'keys';
    const values = 'values';
    const escapes = 'escapes';
    let request = {};
    let response = {};
    let nextFunction = {};
    beforeAll(() => {
        tableName = 'actions';
        controller = new controller_1.ActionController(tableName);
        request = {
            params: {
                id: '1'
            },
            body: {}
        };
        response = {
            status: jest.fn().mockImplementation(() => ({
                json: jest.fn(),
                send: jest.fn()
            }))
        };
        nextFunction = jest.fn();
    });
    it('getActions success', async () => {
        const rows = ['TEST'];
        controller.read = jest.fn().mockResolvedValue({ rows });
        await controller.getActions(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(200);
    });
    it('getActions error', async () => {
        controller.read = jest.fn().mockRejectedValue(new Error());
        await controller.getActions(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(500);
    });
    it('getAction success', async () => {
        const rows = ['TEST'];
        controller.readById = jest.fn().mockResolvedValue({ rows });
        await controller.getAction(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(200);
    });
    it('getAction error', async () => {
        controller.readById = jest.fn().mockRejectedValue(new Error());
        await controller.getAction(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(500);
    });
    it('createAction success', async () => {
        controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes });
        controller.create = jest.fn().mockResolvedValue({ rows });
        await controller.createAction(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(200);
    });
    it('createAction error', async () => {
        controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes });
        controller.create = jest.fn().mockRejectedValue(new Error());
        await controller.createAction(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(500);
    });
    it('updateAction success', async () => {
        controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values });
        controller.buildUpdateString = jest.fn().mockReturnValue({ keys, values });
        controller.update = jest.fn().mockResolvedValue({ rows });
        await controller.updateAction(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(200);
    });
    it('updateAction error', async () => {
        controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values });
        controller.buildUpdateString = jest.fn().mockReturnValue({ query, idx });
        controller.update = jest.fn().mockRejectedValue(new Error());
        await controller.updateAction(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(500);
    });
    it('deleteAction success', async () => {
        controller.deleteById = jest.fn().mockResolvedValue({ rowCount: 2 });
        await controller.deleteAction(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(200);
    });
    it('deleteAction error', async () => {
        controller.deleteById = jest.fn().mockRejectedValue(new Error());
        await controller.deleteAction(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(500);
    });
});
//# sourceMappingURL=controller.test.js.map