import { IVersionController, VersionController } from '../controller';
import { Response, Request } from 'express';
import { NextFunction } from 'connect';

describe('VersionController ', () => {

  let tableName: string;
  let controller: IVersionController;
  // tslint:disable:no-any no-unsafe-any
  let request: any = {};
  let response: any = {};
  let nextFunction: any = {};

  beforeAll(() => {
    tableName = 'versions';
    controller = new VersionController(tableName);
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
    await controller.getVersionsByBatch(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it('getVersionsByBatch error', async () => {
    controller.pool.query  = jest.fn().mockRejectedValue(new Error());
    await controller.getVersionsByBatch(<Request>request, <Response>response, <NextFunction>nextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });
});