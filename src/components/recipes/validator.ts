let Joi = require('joi');

class RecipeValidator {
  get createRecipe() {
    return {
      body: Joi.object().keys({
        name: Joi.string().required(),
        airplane_code: Joi.string().required(),
        yeast: Joi.number(),
        instructions: Joi.object().unknown()
      }).unknown(false)
    };
  }

  get updateRecipe() {
    return {
      body: Joi.object().keys({
        name: Joi.string(),
        airplane_code: Joi.string(),
        yeast: Joi.number(),
        instructions: Joi.object().unknown()
      }).unknown(false)
    };
  }
}

module.exports = new RecipeValidator();
