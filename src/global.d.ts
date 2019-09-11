// tslint:disable:no-any

declare global {
  namespace Express {
    interface Request {
      user: any;
    }
  }
}

export interface IdParams {
  id: any;
}
