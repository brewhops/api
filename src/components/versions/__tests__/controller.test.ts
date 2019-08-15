import { NextFunction } from "connect";
import { Request, Response } from "express";
import { IVersionController, VersionController } from "../controller";

describe("VersionController ", () => {

  let tableName: string;
  let controller: IVersionController;
  // tslint:disable:no-any no-unsafe-any
  let request: any = {};
  let response: any = {};
  let nextFunction: any = {};

  beforeAll(() => {
    tableName = "versions";
    controller = new VersionController(tableName);
    request = {
      params: {
        batchId: "1",
      },
    };
    response = {
      status: jest.fn().mockImplementation(() => ({
        json: jest.fn(),
        send: jest.fn(),
      })),
    };
    nextFunction = jest.fn();
  });

  it("getVersionsByBatch success", async () => {
    const rows = ["TEST"];
    controller.pool.query = jest.fn().mockResolvedValue({ rows });
    await controller.getVersionsByBatch(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it("getVersionsByBatch error", async () => {
    controller.pool.query  = jest.fn().mockRejectedValue(new Error());
    await controller.getVersionsByBatch(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });
});
