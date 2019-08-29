// Thanks Rob!

import Boom from "boom";
import { NextFunction, Request, Response } from "express";
import jwt, { VerifyErrors } from "jsonwebtoken";

// tslint:disable-next-line:no-any
export async function generateAuthToken(userId: any, clientId: any) {
  return new Promise((resolve, reject) => {
    const payload = { 
      userId,
      clientId
    };
    jwt.sign(
      payload,
      process.env.AUTH_KEY as string,
      {
        expiresIn: "24h",
      },
      (err, token) => {
        if (err) {
          reject(err);
        } else {
          resolve(token);
        }
      },
    );
  });
}

// tslint:disable: no-unsafe-any
export function requireAuthentication(req: Request, res: Response, next: NextFunction) {
  // tslint:disable-next-line:no-backbone-get-set-outside-model
  const authHeader = req.get("Authorization") || "";
  const authHeaderParts = authHeader.split(" ");
  const token = authHeaderParts[0] === "Bearer" ? authHeaderParts[1] : "";

  // tslint:disable-next-line:no-any
  jwt.verify(token, process.env.AUTH_KEY as string, (err: VerifyErrors, payload: any) => {
    if (!err) {
      // tslint:disable-next-line:no-unsafe-any
      req.user = payload.userId;
      req.clientId = payload.clientId;
      next();
    } else {
      res.status(401).send(Boom.unauthorized("Invalid authentication token"));
    }
  });
}
