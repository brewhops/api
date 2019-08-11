import { NextFunction } from "connect";
import { Request, Response } from "express";
import { IRecipeController, RecipeController } from "../controller";
// import * as request from 'supertest';

describe("RecipeController ", () => {

  let tableName: string;
  let controller: RecipeController;
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
    tableName = "recipes";
    controller = new RecipeController(tableName);
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

  it("getRecipe success", async () => {
    controller.readById = jest.fn().mockResolvedValueOnce({ rows });
    await controller.getRecipe(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it("getRecipe error", async () => {
    controller.readById = jest.fn().mockRejectedValueOnce(new Error());
    await controller.getRecipe(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it("getRecipes success", async () => {
    controller.read = jest.fn().mockResolvedValueOnce({ rows });
    await controller.getRecipes(request as Request, response as Response);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it("getRecipes error", async () => {
    controller.read = jest.fn().mockRejectedValueOnce(new Error());
    await controller.getRecipes(request as Request, response as Response);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it("createRecipe success", async () => {
    controller.splitObjectKeyVals = jest.fn().mockReturnValueOnce({ keys, values, escapes });
    controller.create = jest.fn().mockResolvedValueOnce({ rows });
    await controller.createRecipe(request as Request, response as Response);
    expect(response.status).toHaveBeenCalledWith(201);
  });

  it("createRecipe error", async () => {
    controller.splitObjectKeyVals = jest.fn().mockReturnValueOnce({ keys, values, escapes });
    controller.create = jest.fn().mockRejectedValueOnce(new Error());
    await controller.createRecipe(request as Request, response as Response);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it("updateRecipe success", async () => {
    controller.splitObjectKeyVals = jest.fn().mockReturnValueOnce({ keys, values, escapes });
    controller.buildUpdateString = jest.fn().mockReturnValueOnce({ query, idx });
    controller.update = jest.fn().mockResolvedValueOnce({ rows });
    await controller.updateRecipe(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it("updateRecipe error", async () => {
    controller.splitObjectKeyVals = jest.fn().mockReturnValueOnce({ keys, values, escapes });
    controller.buildUpdateString = jest.fn().mockReturnValueOnce({ query, idx });
    controller.update = jest.fn().mockRejectedValueOnce(new Error());
    await controller.updateRecipe(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

  it("deleteRecipe success", async () => {
    controller.deleteById = jest.fn().mockResolvedValueOnce({ rows, rowCount: 1 });
    await controller.deleteRecipe(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(200);
  });

  it("deleteRecipe error", async () => {
    controller.deleteById = jest.fn().mockRejectedValueOnce(new Error());
    await controller.deleteRecipe(request as Request, response as Response, nextFunction as NextFunction);
    expect(response.status).toHaveBeenCalledWith(500);
  });

});
