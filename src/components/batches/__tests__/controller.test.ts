import { IBatchesController, BatchesController } from '../controller';
import { Response, Request } from 'express';
import { NextFunction } from 'connect';
import { Batch } from '../types';
import { Pool } from 'pg';
// import * as request from 'supertest';

describe('BatchesController ', () => {

  let tableName: string;
  let controller: IBatchesController;
  // tslint:disable:no-any no-unsafe-any
  let request: any = {};
  let response: any = {};
  let nextFunction: any = {};

  beforeAll(() => {
    tableName = 'batches';
    controller = new BatchesController(tableName);
    request = {
      params: {
        id: '1',
        tankId: '1'
      },
      body: {
        batch_id: '1'
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

  it('getBatches success', async () => {
    const rows = ['TEST'];
    controller.read = jest.fn().mockResolvedValue({ rows });
    await controller.getBatches(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('getBatches error', async () => {
    controller.read = jest.fn().mockRejectedValue(new Error());
    await controller.getBatches(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it('getBatchesByTank success', async () => {
    const results = {
      rows: ['test'],
      rowCount: 2
    };
    controller.read = jest.fn().mockResolvedValue(results);
    await controller.getBatchesByTank(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('getBatchesByTank error', async () => {
    controller.read = jest.fn().mockRejectedValue(new Error());
    await controller.getBatchesByTank(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it('getBatch success', async () => {
    const results = {
      rows: ['test'],
      rowCount: 2
    };
    controller.readById = jest.fn().mockResolvedValue(results);
    await controller.getBatch(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('getBatch error', async () => {
    controller.readById = jest.fn().mockRejectedValue(new Error());
    await controller.getBatch(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it('updateBatch success', async () => {
    const keys = 'keys';
    const values = 'values';
    const escapes = 'escapes';
    controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes });
    controller.readById = jest.fn().mockResolvedValue({ rowCount: 2 });
    controller.buildUpdateString = jest.fn().mockResolvedValue({ query: '', idx: ''});
    controller.update = jest.fn().mockResolvedValue({});
    controller.createInTable = jest.fn().mockResolvedValue({});
    await controller.updateBatch(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('updateBatch error', async () => {
    const keys = 'keys';
    const values = 'values';
    const escapes = 'escapes';
    controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes });
    controller.readById = jest.fn().mockResolvedValue({ rowCount: 2 });
    controller.buildUpdateString = jest.fn().mockResolvedValue({ query: '', idx: ''});
    controller.update = jest.fn().mockRejectedValue(new Error());
    await controller.updateBatch(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it('createBatch success', async () => {
    const batch: Batch = {
      name: '',
      volume: 2,
      bright: 2,
      generation: 2,
      started_on: new Date().toUTCString(),
      recipe_id: 2,
      tank_id: 2,
      update_user: 2
    };

    request.body = batch;
    const keys = 'keys';
    const values = 'values';
    const escapes = 'escapes';

    controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes });
    controller.create = jest.fn().mockResolvedValue({});
    await controller.createBatch(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('createBatch error', async () => {
    const batch: Batch = {
      name: '',
      volume: 2,
      bright: 2,
      generation: 2,
      started_on: new Date().toUTCString(),
      recipe_id: 2,
      tank_id: 2,
      update_user: 2
    };

    request.body = batch;
    const keys = 'keys';
    const values = 'values';
    const escapes = 'escapes';
    controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes });
    controller.create = jest.fn().mockRejectedValue(new Error());
    await controller.createBatch(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it('deleteBatch success', async () => {
    const batch = {
      rowCount: 2
    };
    // tslint:disable-next-line:no-object-literal-type-assertion
    controller.pool = {
      query: jest.fn().mockReturnValue({ rowCount: 2 })
    } as unknown as Pool;
    controller.deleteById = jest.fn().mockResolvedValue(batch);
    await controller.deleteBatch(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('deleteBatch error', async () => {
    const batch = {
      rowCount: 2
    };
    // tslint:disable-next-line:no-object-literal-type-assertion
    controller.pool = {
      query: jest.fn().mockReturnValue({ rowCount: 2 })
    } as unknown as Pool;
    controller.deleteById = jest.fn().mockRejectedValue(new Error());
    await controller.deleteBatch(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it('closeBatch success', async () => {
    const keys = 'keys';
    const values = 'values';
    const escapes = 'escapes';
    controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes});
    controller.buildUpdateString = jest.fn().mockResolvedValue({ query: '', idx: 1});
    controller.deleteById = jest.fn().mockResolvedValue({});
    await controller.closeBatch(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('closeBatch error', async () => {
    const keys = 'keys';
    const values = 'values';
    const escapes = 'escapes';
    controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes});
    controller.buildUpdateString = jest.fn().mockResolvedValue({ query: '', idx: 1});
    controller.deleteById = jest.fn().mockRejectedValue(new Error());
    await controller.closeBatch(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });
});