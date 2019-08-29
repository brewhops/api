// tslint:disable:no-any

declare global {
  namespace Express {
    interface Request {
      user: any;
      clientId: any;
    }
  }
}

export interface IdParams {
  id: any;
}
