import Joi from 'joi';
import { JOIResult } from '../../types/index';

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
          name: Joi.string().required(),
          airplane_code: Joi.string().required(),
          yeast: Joi.number(),
          instructions: Joi.object().unknown()
        })
        .unknown(false)
    };
  },
  updateRecipe() {
    return {
      body: Joi.object()
        .keys({
          name: Joi.string(),
          airplane_code: Joi.string(),
          yeast: Joi.number(),
          instructions: Joi.object().unknown()
        })
        .unknown(false)
    };
  }
};
