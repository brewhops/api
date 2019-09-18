import Boom from "boom";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { TankController } from "../controller";
import { Tank } from "../types";

describe("Tank controller", () => {
  let tableName: string;
  let controller: TankController;
  let tank: Tank;
  let rows: Tank[];
  let keys: string[] = ["keys"];
  let values: string[] = ["values"];
  let escapes: string[] = ["escapes"];
  let error: string;
  let request: any = {};
  let response: any = {};
  const nextFunction: any = {};
  let json: any;
  let send: any;

  beforeEach(() => {
    tableName = "tanks";
    controller = new TankController(tableName);
    tank = {
      disabled: false,
      id: 1,
      in_use: true,
      name: "rad-tank",
      status: "brewing",
    };
    rows = [tank];

    keys = ["keys"];
    values = ["values"];
    escapes = ["escapes"];

    error = "ERROR";

    json = jest.fn();
    send = jest.fn();

    request = {
      body: {
        escapes, keys, values,
      },
      params: {
        id: tank.id,
      },
    };
    response = {
      status: jest.fn().mockImplementation(() => ({
        json,
        send,
      })),
    };
  });

  describe("getTanks", () => {
    it("success", async () => {
      controller.read = jest.fn().mockResolvedValueOnce({ rows });
      await controller.getTanks(request as Request, response as Response);
      expect(response.status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(rows);
    });

    it("error", async () => {
      controller.read = jest.fn().mockRejectedValueOnce(error);
      await controller.getTanks(request as Request, response as Response);
      expect(response.status).toHaveBeenCalledWith(500);
      expect(send).toHaveBeenCalledWith(Boom.badImplementation(error));
    });
  });

  describe("getTank", () => {
    it("success", async () => {
      controller.readById = jest.fn().mockResolvedValueOnce({ rows });
      await controller.getTank(request as Request, response as Response, nextFunction as NextFunction);
      expect(response.status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(tank);
    });

    it("error", async () => {
      controller.readById = jest.fn().mockRejectedValueOnce(error);
      await controller.getTank(request as Request, response as Response, nextFunction as NextFunction);
      expect(response.status).toHaveBeenCalledWith(400);
      expect(send).toHaveBeenCalledWith(Boom.badImplementation(error));
    });
  });

  describe("getTankMonitoring", () => {
    it("success", async () => {
      controller.pool.query = jest.fn().mockResolvedValueOnce({ rows });
      await controller.getTankMonitoring(request as Request, response as Response, nextFunction as NextFunction);
      expect(response.status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(rows);
    });

    it("error", async () => {
      controller.pool.query = jest.fn().mockRejectedValueOnce(error);
      await controller.getTankMonitoring(request as Request, response as Response, nextFunction as NextFunction);
      expect(response.status).toHaveBeenCalledWith(500);
      expect(send).toHaveBeenCalledWith(Boom.badImplementation(error));
    });
  });

  describe("createTank", () => {
    beforeAll(() => {
      controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values, escapes });
    });

    it("success", async () => {
      controller.create = jest.fn().mockResolvedValueOnce({ rows });
      await controller.createTank(request as Request, response as Response);
      expect(response.status).toHaveBeenCalledWith(201);
      expect(json).toHaveBeenCalledWith(tank);
    });

    it("error", async () => {
      controller.create  = jest.fn().mockRejectedValueOnce(error);
      await controller.createTank(request as Request, response as Response);
      expect(response.status).toHaveBeenCalledWith(400);
      expect(send).toHaveBeenCalledWith(Boom.badRequest(error));
    });
  });

  describe("updateTank", () => {
    let query: string;
    let idx: string;

    beforeAll(() => {
      query = "SELECT * FROm table";
      idx = "2";

      controller.splitObjectKeyVals = jest.fn().mockReturnValue({ keys, values });
      controller.buildUpdateString = jest.fn().mockReturnValue({ query, idx });
    });

    it("success", async () => {
      controller.update = jest.fn().mockResolvedValueOnce({ rows });
      await controller.updateTank(request as Request, response as Response, nextFunction as NextFunction);
      expect(response.status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(rows);
    });

    it("error", async () => {
      controller.update  = jest.fn().mockRejectedValueOnce(error);
      await controller.updateTank(request as Request, response as Response, nextFunction as NextFunction);
      expect(response.status).toHaveBeenCalledWith(500);
      expect(send).toHaveBeenCalledWith(Boom.badImplementation(error));
    });

    it("empty request body error", async () => {
      request.body = null;

      controller.update  = jest.fn().mockRejectedValueOnce(error);
      await controller.updateTank(request as Request, response as Response, nextFunction as NextFunction);
      expect(response.status).toHaveBeenCalledWith(400);
      expect(send).toHaveBeenCalledWith(Boom.badRequest("Request does not match valid form"));
    });
  });

  describe("deleteTank", () => {
    let rowCount: number;

    beforeEach(() => {
      rowCount = 4;
    });

    it("success", async () => {
      controller.deleteById = jest.fn().mockResolvedValueOnce({rowCount});
      await controller.deleteTank(request as Request, response as Response, nextFunction as NextFunction);
      expect(response.status).toHaveBeenCalledWith(200);
      expect(json).toHaveBeenCalledWith(`Successfully deleted tank (id=${tank.id})`);
    });

    it("error", async () => {
      controller.deleteById = jest.fn().mockRejectedValueOnce(error);
      await controller.deleteTank(request as Request, response as Response, nextFunction as NextFunction);
      expect(response.status).toHaveBeenCalledWith(500);
      expect(send).toHaveBeenCalledWith(Boom.badImplementation(error));
    });
  });
});
