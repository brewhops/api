// Match user token against the value that was pulled from DB
export function userMatchAuthToken(token, dbUser) {
  if (token === dbUser) {
    return true;
  } else {
    return false;
  }
}
