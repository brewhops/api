import Joi from "joi";
import { JOIResult } from "../../types/index";

export interface RecipeValidator {
  createRecipe: () => JOIResult;
  updateRecipe: () => JOIResult;
}

/**
 * Static validation class for the recipes route
 */
export const RecipeValidator = {
  createRecipe() {
    return {
      body: Joi.object()
        .keys({
          airplane_code: Joi.string().required(),
          instructions: Joi.object().unknown(),
          name: Joi.string().required(),
          yeast: Joi.number(),
        })
        .unknown(false),
    };
  },
  updateRecipe() {
    return {
      body: Joi.object()
        .keys({
          airplane_code: Joi.string(),
          instructions: Joi.object().unknown(),
          name: Joi.string(),
          yeast: Joi.number(),
        })
        .unknown(false),
    };
  },
};
