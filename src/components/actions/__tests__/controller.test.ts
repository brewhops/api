import { IActionController, ActionController } from '../controller';
import { Response, Request } from 'express';
import { NextFunction } from 'connect';
// import * as request from 'supertest';

describe('ActionsController ', () => {

  let tableName: string;
  let controller: IActionController;
  // tslint:disable:no-any no-unsafe-any
  const idx = 1;
  const query = 'query';
  const rows = ['TEST'];
  const keys = ['keys'];
  const values = ['values'];
  const escapes = ['escapes'];
  let request: any = {};
  let response: any = {};
  let nextFunction: any = {};

  beforeAll(() => {
    tableName = 'actions';
    controller = new ActionController(tableName);
    request = {
      params: {
        id: '1'
      },
      body: {
        keys, values, escapes
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

  it('getActions success', async () => {
    controller.read = jest.fn().mockResolvedValue({ rows });
    await controller.getActions(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('getActions error', async () => {
    controller.read = jest.fn().mockRejectedValue(new Error());
    await controller.getActions(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it('getAction success', async () => {
    controller.readById = jest.fn().mockResolvedValue({ rows });
    await controller.getAction(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('getAction no action returned', async () => {
    controller.readById = jest.fn().mockResolvedValue({ rows: [] });
    await controller.getAction(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('getAction error', async () => {
    controller.readById = jest.fn().mockRejectedValue(new Error());
    await controller.getAction(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it('createAction success', async () => {
    controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes });
    controller.create = jest.fn().mockResolvedValue({ rows });
    await controller.createAction(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('createAction error', async () => {
    controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes });
    controller.create = jest.fn().mockRejectedValue(new Error());
    await controller.createAction(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it('updateAction success', async () => {
    controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values });
    controller.buildUpdateString = jest.fn().mockReturnValue({ query, idx });
    controller.update = jest.fn().mockResolvedValue({ rows });
    await controller.updateAction(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('updateAction not updated', async () => {
    controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values });
    controller.buildUpdateString = jest.fn().mockReturnValue({ query, idx });
    controller.update = jest.fn().mockResolvedValue({ rows: [] });
    await controller.updateAction(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('updateAction empty body', async () => {
    request.body = {};
    await controller.updateAction(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(400);
  });

  it('updateAction error', async () => {
    controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values });
    controller.buildUpdateString = jest.fn().mockReturnValue({ query, idx });
    controller.update = jest.fn().mockRejectedValue(new Error());
    await controller.updateAction(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it('deleteAction success', async () => {
    controller.deleteById = jest.fn().mockResolvedValue({ rowCount: 2 });
    await controller.deleteAction(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('deleteAction not deleted', async () => {
    controller.deleteById = jest.fn().mockResolvedValue({ rowCount: 0 });
    await controller.deleteAction(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('deleteAction error', async () => {
    controller.deleteById = jest.fn().mockRejectedValue(new Error());
    await controller.deleteAction(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });
});