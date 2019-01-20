// Thanks Rob!

import jwt, { VerifyErrors } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import Boom from 'boom';

const secretKey = 'SuperSecret';

// tslint:disable-next-line:no-any
export async function generateAuthToken(userID: any) {
  return new Promise((resolve, reject) => {
    const payload = { sub: userID };
    jwt.sign(
      payload,
      secretKey,
      {
        expiresIn: '24h'
      },
      (err, token) => {
        if (err) {
          reject(err);
        } else {
          resolve(token);
        }
      }
    );
  });
}

export function requireAuthentication(req: Request, res: Response, next: NextFunction) {
  // tslint:disable-next-line:no-backbone-get-set-outside-model
  const authHeader = req.get('Authorization') || '';
  const authHeaderParts = authHeader.split(' ');
  const token = authHeaderParts[0] === 'Bearer' ? authHeaderParts[1] : '';

  // tslint:disable-next-line:no-any
  jwt.verify(token, secretKey, (err: VerifyErrors, payload: any) => {
    if (!err) {
      // tslint:disable-next-line:no-unsafe-any
      req.user = payload.sub;
      next();
    } else {
      res.send(Boom.unauthorized('Invalid authentication token'));
    }
  });
}
