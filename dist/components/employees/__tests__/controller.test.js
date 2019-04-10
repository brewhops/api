"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const controller_1 = require("../controller");
const crypto_js_1 = __importDefault(require("crypto-js"));
// import * as request from 'supertest';
describe('EmployeeController ', () => {
    let tableName;
    let controller;
    // tslint:disable:no-any no-unsafe-any
    const id = 1;
    const idx = 1;
    const query = 'test query';
    const rows = ['test'];
    const keys = ['keys'];
    const values = ['values'];
    const escapes = ['escapes'];
    const username = 'username';
    const password = crypto_js_1.default.SHA3('password').toString();
    let request = {};
    let response = {};
    let nextFunction = {};
    beforeAll(() => {
        tableName = 'actions';
        controller = new controller_1.EmployeeController(tableName);
        request = {
            params: {
                id: '1'
            },
            body: {
                username, password
            },
            user: username
        };
        response = {
            status: jest.fn().mockImplementation(() => ({
                json: jest.fn(),
                send: jest.fn()
            }))
        };
        nextFunction = jest.fn();
    });
    beforeEach(() => {
        controller = new controller_1.EmployeeController(tableName);
    });
    it('getEmployee success', async () => {
        controller.readById = jest.fn().mockResolvedValue({ rows });
        await controller.getEmployee(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(200);
    });
    it('getEmployee error', async () => {
        controller.readById = jest.fn().mockRejectedValue(new Error());
        await controller.getEmployee(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(400);
    });
    it('getEmployees success', async () => {
        controller.read = jest.fn().mockResolvedValue({ rows });
        await controller.getEmployees(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(200);
    });
    it('getEmployees error', async () => {
        controller.read = jest.fn().mockRejectedValue(new Error());
        await controller.getEmployees(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(500);
    });
    it('createEmployee success', async () => {
        controller.readByUsername = jest.fn().mockResolvedValue({ rows: [] });
        controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes });
        controller.create = jest.fn().mockResolvedValue({ rows });
        await controller.getEmployees(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(200);
    });
    it('createEmployee error', async () => {
        controller.readByUsername = jest.fn().mockRejectedValue(new Error());
        await controller.getEmployees(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(500);
    });
    it('login success', async () => {
        controller.readByUsername = jest.fn().mockResolvedValue({
            rows: [{
                    id,
                    password
                }]
        });
        controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes });
        controller.create = jest.fn().mockResolvedValue({ rows });
        await controller.login(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(200);
    });
    it('login not authorized', async () => {
        controller.readByUsername = jest.fn().mockResolvedValue({ rows: [] });
        await controller.login(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(401);
    });
    it('login password mismatch', async () => {
        controller.readByUsername = jest.fn().mockResolvedValue({
            rows: [{
                    id,
                    password: 'mismatch'
                }]
        });
        controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes });
        controller.create = jest.fn().mockResolvedValue({ rows });
        await controller.login(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(400);
    });
    it('login error', async () => {
        controller.readByUsername = jest.fn().mockRejectedValue(new Error());
        await controller.login(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(500);
    });
    it('updateEmployee success', async () => {
        controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values });
        controller.buildUpdateString = jest.fn().mockReturnValue({ query, idx });
        controller.readById = jest.fn().mockResolvedValue({ rows });
        controller.isAdmin = jest.fn().mockResolvedValueOnce(true);
        controller.update = jest.fn().mockResolvedValue({ rows, rowCount: 1 });
        await controller.updateEmployee(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(200);
    });
    it('updateEmployee employee does not exist', async () => {
        controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values });
        controller.buildUpdateString = jest.fn().mockReturnValue({ query, idx });
        controller.readById = jest.fn().mockResolvedValue({ rows: [] });
        await controller.updateEmployee(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(500);
    });
    it('updateEmployee not authorized', async () => {
        controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values });
        controller.buildUpdateString = jest.fn().mockReturnValue({ query, idx });
        controller.readById = jest.fn().mockResolvedValue({ rows });
        controller.isAdmin = jest.fn().mockResolvedValueOnce(false);
        await controller.updateEmployee(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(401);
    });
    it('updateEmployee error', async () => {
        controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values });
        controller.buildUpdateString = jest.fn().mockReturnValue({ query, idx });
        controller.readById = jest.fn().mockResolvedValue({ rows });
        controller.isAdmin = jest.fn().mockResolvedValueOnce(true);
        controller.update = jest.fn().mockRejectedValue(new Error());
        await controller.updateEmployee(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(500);
    });
    it('deleteEmployee success', async () => {
        controller.readById = jest.fn().mockResolvedValue({ rows: [{ username }] });
        controller.isAdmin = jest.fn().mockResolvedValueOnce(true);
        controller.deleteById = jest.fn().mockResolvedValue({ rows });
        await controller.deleteEmployee(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(200);
    });
    it('deleteEmployee employee does not exist', async () => {
        controller.readById = jest.fn().mockResolvedValue({ rows: [] });
        await controller.deleteEmployee(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(500);
    });
    it('deleteEmployee employee not deleted', async () => {
        controller.readById = jest.fn().mockResolvedValue({ rows: [{ username }] });
        controller.isAdmin = jest.fn().mockResolvedValueOnce(true);
        controller.deleteById = jest.fn().mockResolvedValue({ rows: [] });
        await controller.deleteEmployee(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(401);
    });
    it('deleteEmployee error', async () => {
        controller.readById = jest.fn().mockResolvedValue({ rows: [{ username }] });
        controller.isAdmin = jest.fn().mockResolvedValueOnce(true);
        controller.deleteById = jest.fn().mockRejectedValue(new Error());
        await controller.deleteEmployee(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(500);
    });
    it('isAdmin accepted', async () => {
        const employee = {
            rows: [{ admin: true }]
        };
        controller.readByUsername = jest.fn().mockResolvedValueOnce(employee);
        const result = await controller.isAdmin(username);
        expect(controller.readByUsername).toHaveBeenCalledWith(username);
        expect(result).toEqual(true);
    });
    it('isAdmin rejected', async () => {
        const employee = {
            rows: [{ admin: false }]
        };
        controller.readByUsername = jest.fn().mockResolvedValueOnce(employee);
        const result = await controller.isAdmin(username);
        expect(controller.readByUsername).toHaveBeenCalledWith(username);
        expect(result).toEqual(false);
    });
    it('isAdmin error', async () => {
        controller.readByUsername = jest.fn().mockRejectedValue(new Error());
        try {
            await controller.isAdmin(username);
        }
        catch (err) {
            expect(err).toEqual(new Error());
        }
    });
    it('verifyAdmin accepted', async () => {
        controller.isAdmin = jest.fn().mockResolvedValueOnce(true);
        await controller.verifyAdmin(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(200);
    });
    it('verifyAdmin rejected', async () => {
        controller.isAdmin = jest.fn().mockRejectedValueOnce(new Error());
        await controller.verifyAdmin(request, response, nextFunction);
        expect(response.status).toHaveBeenCalledWith(200);
    });
});
//# sourceMappingURL=controller.test.js.map