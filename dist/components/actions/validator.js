"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
/**
 * Static validation class for the 'actions' route
 * @export
 * @class ActionValidator
 */
exports.ActionValidator = {
    createAction() {
        return {
            body: joi_1.default.object()
                .keys({
                name: joi_1.default.string().required(),
                description: joi_1.default.string().required()
            })
                .unknown(false)
        };
    },
    updateAction() {
        return {
            body: joi_1.default.object()
                .keys({
                name: joi_1.default.string(),
                description: joi_1.default.string()
            })
                .unknown(false)
        };
    }
};
//# sourceMappingURL=validator.js.map