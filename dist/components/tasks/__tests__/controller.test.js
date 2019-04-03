"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = require("../controller");
describe('TaskController ', () => {
    let tableName;
    let controller;
    // tslint:disable:no-any no-unsafe-any
    const query = 'test query';
    const idx = 'idx';
    const rows = ['TEST'];
    const keys = ['keys'];
    const values = ['values'];
    const escapes = ['escapes'];
    let request = {};
    let response = {};
    let nextFunction = {};
    beforeAll(() => {
        tableName = 'tasks';
        controller = new controller_1.TaskController(tableName);
        request = {
            params: {
                batchId: '1'
            },
            body: {
                id: '1',
                batch_id: '1',
                completed_on: undefined
            }
        };
        response = {
            status: jest.fn().mockImplementation(() => ({
                json: jest.fn(),
                send: jest.fn(),
                end: jest.fn()
            }))
        };
        nextFunction = jest.fn();
    });
    it('getTasks success', async () => {
        controller.read = jest.fn().mockResolvedValue({ rows });
        await controller.getTasks(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(200);
    });
    it('getTasks error', async () => {
        controller.read = jest.fn().mockRejectedValue(new Error());
        await controller.getTasks(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(500);
    });
    it('getTasksByBatch success', async () => {
        controller.read = jest.fn().mockResolvedValue({ rows });
        await controller.getTasksByBatch(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(200);
    });
    it('getTasksByBatch error', async () => {
        controller.read = jest.fn().mockRejectedValue(new Error());
        await controller.getTasksByBatch(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(500);
    });
    it('createTask success', async () => {
        controller.pool.query = jest.fn().mockResolvedValue({ rowCount: 0 });
        controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes });
        controller.createInTable = jest.fn().mockResolvedValue({ rows });
        await controller.createTask(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(201);
    });
    it('createTask task already exists error', async () => {
        controller.pool.query = jest.fn().mockResolvedValue({ rowCount: 1 });
        controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes });
        controller.createInTable = jest.fn().mockResolvedValue({ rows });
        await controller.createTask(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(400);
    });
    it('createTask task close open task error', async () => {
        request.body.completed_on = '1';
        controller.pool.query = jest.fn().mockResolvedValue({ rowCount: 1 });
        controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes });
        controller.createInTable = jest.fn().mockResolvedValue({ rows });
        await controller.createTask(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(400);
    });
    it('createTask task create database  error', async () => {
        controller.pool.query = jest.fn().mockResolvedValue({ rowCount: 0 });
        controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes });
        controller.createInTable = jest.fn().mockResolvedValue({ rows: [] });
        await controller.createTask(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(500);
    });
    it('createTask error', async () => {
        controller.pool.query = jest.fn().mockResolvedValue({ rowCount: 0 });
        controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes });
        controller.createInTable = jest.fn().mockRejectedValue(new Error());
        await controller.createTask(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(500);
    });
    it('updateTask success', async () => {
        controller.splitObjectKeyVals = jest.fn().mockReturnValueOnce({ keys, values });
        controller.buildUpdateString = jest.fn().mockReturnValueOnce({ query, idx });
        controller.update = jest.fn().mockResolvedValueOnce({ rows, rowCount: 1 });
        await controller.updateTask(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(200);
    });
    it('updateTask id undefined error', async () => {
        request.body.id = undefined;
        controller.splitObjectKeyVals = jest.fn().mockReturnValueOnce({ keys, values });
        controller.buildUpdateString = jest.fn().mockReturnValueOnce({ query, idx });
        controller.update = jest.fn().mockResolvedValueOnce({ rows, rowCount: 1 });
        await controller.updateTask(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(400);
        request.body.id = '1';
    });
    it('updateTask update in db error', async () => {
        controller.splitObjectKeyVals = jest.fn().mockReturnValueOnce({ keys, values });
        controller.buildUpdateString = jest.fn().mockReturnValueOnce({ query, idx });
        controller.update = jest.fn().mockResolvedValueOnce({ rows, rowCount: -1 });
        await controller.updateTask(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(404);
    });
    it('updateTask error', async () => {
        controller.splitObjectKeyVals = jest.fn().mockReturnValueOnce({ keys, values });
        controller.buildUpdateString = jest.fn().mockReturnValueOnce({ query, idx });
        controller.update = jest.fn().mockRejectedValueOnce(new Error());
        await controller.updateTask(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(500);
    });
});
//# sourceMappingURL=controller.test.js.map