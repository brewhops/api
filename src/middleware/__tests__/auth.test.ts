import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { generateAuthToken, requireAuthentication } from "../auth";

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn((x: object, y: string, z: object, callback: () => string | Error): string | Error => callback()),
  verify: jest.fn(
    (x: string, y: string, callback: (error: any, payload: any) => void) => callback(null, { sub: "test"}),
  ),
}));

describe("auth", () => {
  describe("generateAuthToken", () => {
    let userId: number;
    let payload: any;
    let expiration: jwt.SignOptions;

    beforeAll(() => {
      userId = 1;
      payload = {
        sub: userId,
      };
      expiration = {
        expiresIn: "24h",
      };
    });

    it("calls jwt.sign asyncronously with correct args", async () => {
      return generateAuthToken(userId).then((data) =>
        expect(jwt.sign).toHaveBeenCalledWith(payload, process.env.AUTH_KEY, expiration, expect.any(Function)),
      );
    });
  });

  describe("requireAuthentication", () => {
    let req: any;
    let res: any;
    let next: any;
    let token: string;

    beforeAll(() => {
      token = "test-token-123-yay";
      req = {
        get: jest.fn(() => `Bearer ${token}`),
        user: "",
      };
      res = {
        status: jest.fn(() => ({
          send: jest.fn(),
        })),
      };
      next = jest.fn();
    });

    it("verify token successfully", () => {
      requireAuthentication(req as Request, res as Response, next as NextFunction);
      expect(next).toHaveBeenCalled();
    });
  });
});
