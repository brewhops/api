"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
/**
 * Static validation class for the batches routes
 */
exports.BatchesValidator = {
    createBatch() {
        return {
            body: joi_1.default.object().keys({
                name: joi_1.default.string().required(),
                volume: joi_1.default.number().required(),
                bright: joi_1.default.number().required(),
                generation: joi_1.default.number().required(),
                recipe_id: joi_1.default.number().required(),
                tank_id: joi_1.default.number().required(),
                SG: joi_1.default.number().required(),
                PH: joi_1.default.number().required(),
                ABV: joi_1.default.number().required(),
                temperature: joi_1.default.number().required(),
                pressure: joi_1.default.number().required(),
                measure_on: joi_1.default.string(),
                action: joi_1.default.object().keys({
                    id: joi_1.default.number(),
                    completed: joi_1.default.boolean(),
                    assigned: joi_1.default.boolean(),
                    employee: joi_1.default.object().keys({
                        id: joi_1.default.number()
                    })
                })
            })
        };
    },
    updateBatch() {
        return {
            body: joi_1.default.object()
                .keys({
                name: joi_1.default.string(),
                volume: joi_1.default.number(),
                bright: joi_1.default.number(),
                generation: joi_1.default.number(),
                recipe_id: joi_1.default.number(),
                tank_id: joi_1.default.number(),
                SG: joi_1.default.number(),
                PH: joi_1.default.number(),
                ABV: joi_1.default.number(),
                temperature: joi_1.default.number(),
                pressure: joi_1.default.number(),
                measure_on: joi_1.default.number()
            })
                .unknown(false)
        };
    }
};
//# sourceMappingURL=validator.js.map