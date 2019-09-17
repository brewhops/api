import { NextFunction } from "connect";
import { Request, Response } from "express";
import { Pool } from "pg";
import { BatchesController, IBatchesController } from "../controller";
import { Batch } from "../types";

describe("BatchesController ", () => {

  let tableName: string;
  let controller: IBatchesController;
  // tslint:disable:no-any no-unsafe-any
  const keys = "keys";
  const values = "values";
  const escapes = "escapes";
  let request: any = {};
  let response: any = {};
  let nextFunction: any = {};

  beforeAll(() => {
    tableName = "batches";
    controller = new BatchesController(tableName);
    request = {
      body: {
        batch_id: "1",
      },
      params: {
        id: "1",
        tankId: "1",
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

  it("getBatches success", async () => {
    const rows = ["TEST"];
    controller.read = jest.fn().mockResolvedValue({ rows });
    await controller.getBatches(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it("getBatches error", async () => {
    controller.read = jest.fn().mockRejectedValue(new Error());
    await controller.getBatches(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it("getBatchesByTank success", async () => {
    const results = {
      rowCount: 2,
      rows: ["test"],
    };
    controller.read = jest.fn().mockResolvedValue(results);
    await controller.getBatchesByTank(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it("getBatchesByTank error", async () => {
    controller.read = jest.fn().mockRejectedValue(new Error());
    await controller.getBatchesByTank(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it("getBatch success", async () => {
    const results = {
      rowCount: 2,
      rows: ["test"],
    };
    controller.readById = jest.fn().mockResolvedValue(results);
    await controller.getBatch(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it("getBatch error", async () => {
    controller.readById = jest.fn().mockRejectedValue(new Error());
    await controller.getBatch(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it("updateBatch success", async () => {
    controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes });
    controller.readById = jest.fn().mockResolvedValue({ rowCount: 2 });
    controller.buildUpdateString = jest.fn().mockResolvedValue({ query: "", idx: ""});
    controller.update = jest.fn().mockResolvedValue({});
    controller.createInTable = jest.fn().mockResolvedValue({});
    await controller.updateBatch(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it("updateBatch error", async () => {
    controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes });
    controller.readById = jest.fn().mockResolvedValue({ rowCount: 2 });
    controller.buildUpdateString = jest.fn().mockResolvedValue({ query: "", idx: ""});
    controller.update = jest.fn().mockRejectedValue(new Error());
    await controller.updateBatch(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it("createBatch success", async () => {
    const batch: Batch = {
      bright: 2,
      generation: 2,
      name: "",
      recipe_id: 2,
      started_on: new Date().toUTCString(),
      tank_id: 2,
      update_user: 2,
      volume: 2,
      client_id: 2
    };

    request.body = batch;

    controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes });
    controller.create = jest.fn().mockResolvedValue({});
    await controller.createBatch(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it("createBatch error", async () => {
    const batch: Batch = {
      bright: 2,
      generation: 2,
      name: "",
      recipe_id: 2,
      started_on: new Date().toUTCString(),
      tank_id: 2,
      update_user: 2,
      volume: 2,
      client_id: 2
    };

    request.body = batch;

    controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes });
    controller.create = jest.fn().mockRejectedValue(new Error());
    await controller.createBatch(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it("deleteBatch success", async () => {
    const batch = {
      rowCount: 2,
    };
    // tslint:disable-next-line:no-object-literal-type-assertion
    controller.pool = {
      query: jest.fn().mockReturnValue({ rowCount: 2 }),
    } as unknown as Pool;
    controller.deleteById = jest.fn().mockResolvedValue(batch);
    await controller.deleteBatch(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it("deleteBatch error", async () => {
    const batch = {
      rowCount: 2,
    };
    // tslint:disable-next-line:no-object-literal-type-assertion
    controller.pool = {
      query: jest.fn().mockReturnValue({ rowCount: 2 }),
    } as unknown as Pool;
    controller.deleteById = jest.fn().mockRejectedValue(new Error());
    await controller.deleteBatch(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it("closeBatch success", async () => {
    controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes});
    controller.buildUpdateString = jest.fn().mockResolvedValue({ query: "", idx: 1});
    controller.deleteById = jest.fn().mockResolvedValue({});
    await controller.closeBatch(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it("closeBatch error", async () => {
    controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes});
    controller.buildUpdateString = jest.fn().mockResolvedValue({ query: "", idx: 1});
    controller.deleteById = jest.fn().mockRejectedValue(new Error());
    await controller.closeBatch(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });
});
