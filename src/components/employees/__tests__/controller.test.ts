import { IEmployeeController, EmployeeController } from '../controller';
import { Response, Request } from 'express';
import { NextFunction } from 'connect';
import CryptoJS from 'crypto-js';
// import * as request from 'supertest';

describe('EmployeeController ', () => {

  let tableName: string;
  let controller: IEmployeeController;
  // tslint:disable:no-any no-unsafe-any
  const id = 1;
  const idx = 1;
  const query = 'test query';
  const rows = ['test'];
  const keys = ['keys'];
  const values = ['values'];
  const escapes = ['escapes'];
  const username = 'username';
  const password = CryptoJS.SHA3('password').toString();
  let request: any = {};
  let response: any = {};
  let nextFunction: any = {};

  beforeAll(() => {
    tableName = 'actions';
    controller = new EmployeeController(tableName);
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

  it('getEmployee success', async () => {
    controller.readById = jest.fn().mockResolvedValue({ rows });
    await controller.getEmployee(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('getEmployee error', async () => {
    controller.readById = jest.fn().mockRejectedValue(new Error());
    await controller.getEmployee(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(400);
  });

  it('getEmployees success', async () => {
    controller.read = jest.fn().mockResolvedValue({ rows });
    await controller.getEmployees(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('getEmployees error', async () => {
    controller.read= jest.fn().mockRejectedValue(new Error());
    await controller.getEmployees(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it('createEmployee success', async () => {
    controller.readByUsername = jest.fn().mockResolvedValue({ rows: [] });
    controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes });
    controller.create = jest.fn().mockResolvedValue({ rows });
    await controller.getEmployees(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('createEmployee error', async () => {
    controller.readByUsername = jest.fn().mockRejectedValue(new Error());
    await controller.getEmployees(<Request>request, <Response>response, <NextFunction>nextFunction);
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
    await controller.login(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('login not authorized', async () => {
    controller.readByUsername = jest.fn().mockResolvedValue({ rows: [] });
    await controller.login(<Request>request, <Response>response, <NextFunction>nextFunction);
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
    await controller.login(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(400);
  });

  it('login error', async () => {
    controller.readByUsername = jest.fn().mockRejectedValue(new Error());
    await controller.login(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it('updateEmployee success', async () => {
    controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values });
    controller.buildUpdateString = jest.fn().mockReturnValue({ query, idx });
    controller.readById = jest.fn().mockResolvedValue({ rows });
    controller.isAdmin = jest.fn().mockResolvedValue(true);
    controller.update = jest.fn().mockResolvedValue({ rows, rowCount: 1 });
    await controller.updateEmployee(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('updateEmployee employee does not exist', async () => {
    controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values });
    controller.buildUpdateString = jest.fn().mockReturnValue({ query, idx });
    controller.readById = jest.fn().mockResolvedValue({ rows: [] });
    await controller.updateEmployee(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it('updateEmployee not authorized', async () => {
    controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values });
    controller.buildUpdateString = jest.fn().mockReturnValue({ query, idx });
    controller.readById = jest.fn().mockResolvedValue({ rows });
    controller.isAdmin = jest.fn().mockResolvedValue(false);
    await controller.updateEmployee(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(401);
  });

  it('updateEmployee error', async () => {
    controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values });
    controller.buildUpdateString = jest.fn().mockReturnValue({ query, idx });
    controller.readById = jest.fn().mockResolvedValue({ rows });
    controller.isAdmin = jest.fn().mockResolvedValue(true);
    controller.update = jest.fn().mockRejectedValue(new Error());
    await controller.updateEmployee(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it('deleteEmployee success', async () => {
    controller.readById = jest.fn().mockResolvedValue({ rows: [{ username }] });
    controller.isAdmin = jest.fn().mockResolvedValue(true);
    controller.deleteById = jest.fn().mockResolvedValue({ rows });
    await controller.deleteEmployee(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('deleteEmployee employee does not exist', async () => {
    controller.readById = jest.fn().mockResolvedValue({ rows: [] });
    await controller.deleteEmployee(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it('deleteEmployee employee not deleted', async () => {
    controller.readById = jest.fn().mockResolvedValue({ rows: [{ username }] });
    controller.isAdmin = jest.fn().mockResolvedValue(true);
    controller.deleteById = jest.fn().mockResolvedValue({ rows: [] });
    await controller.deleteEmployee(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(401);
  });

  it('deleteEmployee error', async () => {
    controller.readById = jest.fn().mockResolvedValue({ rows: [{ username }] });
    controller.isAdmin = jest.fn().mockResolvedValue(true);
    controller.deleteById = jest.fn().mockRejectedValue(new Error());
    await controller.deleteEmployee(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it('verifyAdmin accepted', async () => {
    controller.isAdmin = jest.fn().mockResolvedValue(true);
    await controller.verifyAdmin(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('verifyAdmin rejected', async () => {
    controller.isAdmin = jest.fn().mockRejectedValue(new Error());
    await controller.verifyAdmin(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('isAdmin accepted', async () => {
    controller.readByUsername = jest.fn().mockResolvedValue({
      rows: [{
        admin: true
      }]
    });

    expect(await controller.isAdmin(username)).toEqual(true);
  });

  it('isAdmin rejected', async () => {
    controller.readByUsername = jest.fn().mockResolvedValue({
      rows: [{}]
    });

    expect(await controller.isAdmin(username)).toEqual(undefined);
  });

  it('isAdmin error', async () => {
    controller.readByUsername = jest.fn().mockRejectedValue(new Error());
    try {
      await controller.isAdmin(username);
    } catch (err) {
      expect(err).toEqual(new Error());
    }
  });
});