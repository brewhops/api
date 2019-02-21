"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable-next-line: no-unsafe-any no-unnecessary-callback-wrapper no-any
exports.wrapRequest = (handler) => async (req, res, next) => handler(req, res, next);
//# sourceMappingURL=request_wrapper.js.map