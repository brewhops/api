import Joi from "joi";
import { JOIResult } from "../../types";

export interface IBatchesValidator {
  createBatch: () => JOIResult;
  updateBatch: () => JOIResult;
}

/**
 * Static validation class for the batches routes
 */
export const BatchesValidator: IBatchesValidator = {
  createBatch() {
    return {
      body: Joi.object().keys({
        ABV: Joi.number().required(),
        PH: Joi.number().required(),
        SG: Joi.number().required(),
        action: Joi.object().keys({
          assigned: Joi.boolean(),
          completed: Joi.boolean(),
          employee: Joi.object().keys({
            id: Joi.number(),
          }),
          id: Joi.number(),
        }),
        bright: Joi.number().required(),
        generation: Joi.number().required(),
        measure_on: Joi.string(),
        name: Joi.string().required(),
        pressure: Joi.number().required(),
        recipe_id: Joi.number().required(),
        tank_id: Joi.number().required(),
        temperature: Joi.number().required(),
        volume: Joi.number().required(),
      }),
    };
  },
  updateBatch() {
    return {
      body: Joi.object()
        .keys({
          ABV: Joi.number(),
          PH: Joi.number(),
          SG: Joi.number(),
          bright: Joi.number(),
          generation: Joi.number(),
          measure_on: Joi.number(),
          name: Joi.string(),
          pressure: Joi.number(),
          recipe_id: Joi.number(),
          tank_id: Joi.number(),
          temperature: Joi.number(),
          volume: Joi.number(),
        })
        .unknown(false),
    };
  },
};
