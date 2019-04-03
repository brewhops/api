"use strict";
// Thanks Rob!
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const boom_1 = __importDefault(require("boom"));
const secretKey = 'SuperSecret';
// tslint:disable-next-line:no-any
async function generateAuthToken(userID) {
    return new Promise((resolve, reject) => {
        const payload = { sub: userID };
        jsonwebtoken_1.default.sign(payload, secretKey, {
            expiresIn: '24h'
        }, (err, token) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(token);
            }
        });
    });
}
exports.generateAuthToken = generateAuthToken;
function requireAuthentication(req, res, next) {
    // tslint:disable-next-line:no-backbone-get-set-outside-model
    const authHeader = req.get('Authorization') || '';
    const authHeaderParts = authHeader.split(' ');
    const token = authHeaderParts[0] === 'Bearer' ? authHeaderParts[1] : '';
    // tslint:disable-next-line:no-any
    jsonwebtoken_1.default.verify(token, secretKey, (err, payload) => {
        if (!err) {
            // tslint:disable-next-line:no-unsafe-any
            req.user = payload.sub;
            next();
        }
        else {
            res.status(401).send(boom_1.default.unauthorized('Invalid authentication token'));
        }
    });
}
exports.requireAuthentication = requireAuthentication;
//# sourceMappingURL=auth.js.map