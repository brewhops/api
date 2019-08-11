import { NextFunction } from "connect";
import { Request, Response } from "express";
import { ActionController, IActionController } from "../controller";
// import * as request from 'supertest';

describe("ActionsController ", () => {

  let tableName: string;
  let controller: IActionController;
  // tslint:disable:no-any no-unsafe-any
  const idx = 1;
  const query = "query";
  const rows = ["TEST"];
  const keys = ["keys"];
  const values = ["values"];
  const escapes = ["escapes"];
  let request: any = {};
  let response: any = {};
  let nextFunction: any = {};

  beforeAll(() => {
    tableName = "actions";
    controller = new ActionController(tableName);
    request = {
      body: {
        escapes, keys, values,
      },
      params: {
        id: "1",
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

  it("getActions success", async () => {
    controller.read = jest.fn().mockResolvedValue({ rows });
    await controller.getActions(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it("getActions error", async () => {
    controller.read = jest.fn().mockRejectedValue(new Error());
    await controller.getActions(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it("getAction success", async () => {
    controller.readById = jest.fn().mockResolvedValue({ rows });
    await controller.getAction(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it("getAction no action returned", async () => {
    controller.readById = jest.fn().mockResolvedValue({ rows: [] });
    await controller.getAction(request as Request, response as Response, nextFunction as NextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });

  it("getAction error", async () => {
    controller.readById = jest.fn().mockRejectedValue(new Error());
    await controller.getAction(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it("createAction success", async () => {
    controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes });
    controller.create = jest.fn().mockResolvedValue({ rows });
    await controller.createAction(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it("createAction error", async () => {
    controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes });
    controller.create = jest.fn().mockRejectedValue(new Error());
    await controller.createAction(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it("updateAction success", async () => {
    controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values });
    controller.buildUpdateString = jest.fn().mockReturnValue({ query, idx });
    controller.update = jest.fn().mockResolvedValue({ rows });
    await controller.updateAction(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it("updateAction not updated", async () => {
    controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values });
    controller.buildUpdateString = jest.fn().mockReturnValue({ query, idx });
    controller.update = jest.fn().mockResolvedValue({ rows: [] });
    await controller.updateAction(request as Request, response as Response, nextFunction as NextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });

  it("updateAction empty body", async () => {
    request.body = {};
    await controller.updateAction(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(400);
  });

  it("updateAction error", async () => {
    controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values });
    controller.buildUpdateString = jest.fn().mockReturnValue({ query, idx });
    controller.update = jest.fn().mockRejectedValue(new Error());
    await controller.updateAction(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it("deleteAction success", async () => {
    controller.deleteById = jest.fn().mockResolvedValue({ rowCount: 2 });
    await controller.deleteAction(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it("deleteAction not deleted", async () => {
    controller.deleteById = jest.fn().mockResolvedValue({ rowCount: 0 });
    await controller.deleteAction(request as Request, response as Response, nextFunction as NextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });

  it("deleteAction error", async () => {
    controller.deleteById = jest.fn().mockRejectedValue(new Error());
    await controller.deleteAction(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });
});
