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
  const keys = "keys";
  const values: any[] = [];
  const escapes = "escapes";

  beforeAll(() => {
    tableName = "versions";
    controller = new VersionController(tableName);
    request = {
      params: {
        batchId: "1",
        id: "1"
      },
    };
    response = {
      status: jest.fn().mockImplementation(() => ({
        json: jest.fn(),
        send: jest.fn(),
        end: jest.fn()
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

  it("patchVersion success", async () => {
    const rows = ["TEST"];
    controller.readById = jest.fn().mockResolvedValue({ rowCount: 1 });
    controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes});
    controller.buildUpdateString = jest.fn().mockResolvedValue({ query: "", idx: 1});
    controller.update = jest.fn().mockResolvedValue({});
    await controller.patchVersion(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(204);
  });

  it("patchVersion error", async () => {
    const rows = ["TEST"];
    controller.readById = jest.fn().mockResolvedValue({ rowCount: 1 });
    controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes});
    controller.buildUpdateString = jest.fn().mockResolvedValue({ query: "", idx: 1});
    controller.update = jest.fn().mockRejectedValue({});
    await controller.patchVersion(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it("patchVersion not found", async () => {
    controller.readById = jest.fn().mockResolvedValue({ rowCount: 0 });
    controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes});
    await controller.patchVersion(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(404);
  });

  it("deleteVersion success", async () => {
    controller.deleteById = jest.fn().mockResolvedValue({ rowCount: 1 });
    await controller.deleteVersion(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it("deleteVersion error", async () => {
    controller.deleteById = jest.fn().mockRejectedValue({});
    await controller.deleteVersion(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it("deleteVersion not found", async () => {
    controller.deleteById = jest.fn().mockResolvedValue({ rowCount: 0 });
    await controller.deleteVersion(request as Request, response as Response, nextFunction as NextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });
});
