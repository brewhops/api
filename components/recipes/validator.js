let Joi = require('joi')

class RecipeValidator {
  get createRecipe () {
    return {
      body: Joi.object().keys({
        airplane_code: Joi.string().required(),
        instructions: Joi.object().unknown()
      }).unknown(false)
    }
  }

  get updateRecipe () {
    return {
      body: Joi.object().keys({
        airplane_code: Joi.string(),
        instructions: Joi.object().unknown()
      }).unknown(false)
    }
  }
}

module.exports = new RecipeValidator()
