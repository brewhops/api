"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
/**
 * Static validation class for the employees routes
 */
exports.EmployeeValidator = {
    createEmployee() {
        return {
            body: joi_1.default.object()
                .keys({
                first_name: joi_1.default.string().required(),
                last_name: joi_1.default.string().required(),
                username: joi_1.default.string().required(),
                password: joi_1.default.string().required(),
                phone: joi_1.default.string(),
                admin: joi_1.default.boolean()
            })
                .unknown(false)
        };
    },
    updateEmployee() {
        return {
            body: joi_1.default.object()
                .keys({
                first_name: joi_1.default.string(),
                last_name: joi_1.default.string(),
                username: joi_1.default.string(),
                password: joi_1.default.string(),
                phone: joi_1.default.string(),
                admin: joi_1.default.boolean()
            })
                .unknown(false)
        };
    },
    login() {
        return {
            body: joi_1.default.object()
                .keys({
                username: joi_1.default.string().required(),
                password: joi_1.default.string().required()
            })
                .unknown(false)
        };
    }
};
//# sourceMappingURL=validator.js.map