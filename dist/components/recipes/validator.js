"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
/**
 * Static validation class for the recipes route
 */
exports.RecipeValidator = {
    createRecipe() {
        return {
            body: joi_1.default.object()
                .keys({
                name: joi_1.default.string().required(),
                airplane_code: joi_1.default.string().required(),
                yeast: joi_1.default.number(),
                instructions: joi_1.default.object().unknown()
            })
                .unknown(false)
        };
    },
    updateRecipe() {
        return {
            body: joi_1.default.object()
                .keys({
                name: joi_1.default.string(),
                airplane_code: joi_1.default.string(),
                yeast: joi_1.default.number(),
                instructions: joi_1.default.object().unknown()
            })
                .unknown(false)
        };
    }
};
//# sourceMappingURL=validator.js.map