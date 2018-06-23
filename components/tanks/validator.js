let Joi = require('joi')

class TankValidator {
  get createTank () {
    return {
      body: Joi.object().keys({
        name: Joi.string().required(),
        status: Joi.string().required(),
        in_use: Joi.boolean().required()
      }).unknown(false)
    }
  }

  get updateTank () {
    return {
      body: Joi.object().keys({
        name: Joi.string(),
        status: Joi.string(),
        in_use: Joi.boolean()
      }).unknown(false)
    }
  }
}

module.exports = new TankValidator()
