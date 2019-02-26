"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Match user token against the value that was pulled from DB
// tslint:disable-next-line:no-any
function userMatchAuthToken(token, dbUser) {
    // tslint:disable-next-line:possible-timing-attack
    return token === dbUser ? true : false;
}
exports.userMatchAuthToken = userMatchAuthToken;
//# sourceMappingURL=auth.js.map