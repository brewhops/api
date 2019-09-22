import * as Joi from "joi";

/**
 * Validates the tank information
 * @export
 * @class TankValidator
 */
export const TankValidator = {
  get createTank() {
    return {
      body: Joi.object()
        .keys({
          in_use: Joi.boolean().required(),
          name: Joi.string().required(),
          status: Joi.string().required(),
        })
        .unknown(false),
    };
  },
  get updateTank() {
    return {
      body: Joi.object()
        .keys({
          disabled: Joi.boolean(),
          in_use: Joi.boolean(),
          name: Joi.string(),
          status: Joi.string(),
          update_user: Joi.number(),
        })
        .unknown(false),
    };
  },
};
