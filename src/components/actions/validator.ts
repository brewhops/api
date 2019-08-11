import Joi from "joi";
import { JOIResult } from "../../types";

export interface IActionValidator {
  createAction: () => JOIResult;
  updateAction: () => JOIResult;
}

/**
 * Static validation class for the 'actions' route
 * @export
 * @class ActionValidator
 */
export const ActionValidator: IActionValidator = {
  createAction(): JOIResult {
    return {
      body: Joi.object()
        .keys({
          description: Joi.string().required(),
          name: Joi.string().required(),
        })
        .unknown(false),
    };
  },
  updateAction(): JOIResult {
    return {
      body: Joi.object()
        .keys({
          description: Joi.string(),
          name: Joi.string(),
        })
        .unknown(false),
    };
  },
};
