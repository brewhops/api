import * as Joi from 'joi';

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
