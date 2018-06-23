let Joi = require('joi')

class BatchesValidator {
  get createBatch () {
    return {
      body: Joi.object().keys({
        name: Joi.string().required(),
        volume: Joi.number().required(),
        bright: Joi.number().required(),
        generation: Joi.number().required(),
        recipe_id: Joi.number().required(),
        tank_id: Joi.number().required(),
        SG: Joi.number().required(),
        PH: Joi.number().required(),
        ABV: Joi.number().required(),
        temperature: Joi.number().required(),
        pressure: Joi.number().required(),
        measure_on: Joi.string(),
        action: Joi.object().keys({
          id: Joi.number(),
          completed: Joi.boolean(),
          assigned: Joi.boolean(),
          employee: Joi.object().keys({
            id: Joi.number()
          })
        })
      })
    }
  }

  get updateBatch () {
    return {
      body: Joi.object().keys({
        name: Joi.string(),
        volume: Joi.number(),
        bright: Joi.number(),
        generation: Joi.number(),
        recipe_id: Joi.number(),
        tank_id: Joi.number(),
        SG: Joi.number(),
        PH: Joi.number(),
        ABV: Joi.number(),
        temperature: Joi.number(),
        pressure: Joi.number(),
        measure_on: Joi.number()
      }).unknown(false)
    }
  }
}

module.exports = new BatchesValidator()
