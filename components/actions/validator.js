let Joi = require('joi')

class ActionValidator {
  get createAction () {
    return {
      body: Joi.object().keys({
        name: Joi.string().required(),
        description: Joi.string().required()
      }).unknown(false)
    }
  }

  get updateAction () {
    return {
      body: Joi.object().keys({
        name: Joi.string(),
        description: Joi.string()
      }).unknown(false)
    }
  }
}

module.exports = new ActionValidator()
