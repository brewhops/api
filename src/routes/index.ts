// tslint:disable:no-any

declare global {
  namespace Express {
      export interface Request {
          user: any;
      }
  }
}

export interface IdParams {
  id: any;
}
