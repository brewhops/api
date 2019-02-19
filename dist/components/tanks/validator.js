"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Joi = __importStar(require("joi"));
/**
 * Validates the tank information
 * @export
 * @class TankValidator
 */
exports.TankValidator = {
    get createTank() {
        return {
            body: Joi.object()
                .keys({
                name: Joi.string().required(),
                status: Joi.string().required(),
                in_use: Joi.boolean().required()
            })
                .unknown(false)
        };
    },
    get updateTank() {
        return {
            body: Joi.object()
                .keys({
                name: Joi.string(),
                status: Joi.string(),
                in_use: Joi.boolean()
            })
                .unknown(false)
        };
    }
};
//# sourceMappingURL=validator.js.map