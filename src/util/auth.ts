// Match user token against the value that was pulled from DB
// tslint:disable-next-line:no-any
export function userMatchAuthToken(token: any, dbUser: any): boolean {
  // tslint:disable-next-line:possible-timing-attack
  return token === dbUser ? true : false;
}
