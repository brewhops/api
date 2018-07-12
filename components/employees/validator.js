let Joi = require('joi')

class UserValidator {
  get createUser() {
    return {
      body: Joi.object().keys({
        first_name: Joi.string().required(),
        last_name: Joi.string().required(),
        username: Joi.string().required(),
        password: Joi.string().required(),
        phone: Joi.string().required(),
        admin: Joi.boolean()
      }).unknown(false)
    }
  }

  get updateUser() {
    return {
      body: Joi.object().keys({
        first_name: Joi.string(),
        last_name: Joi.string(),
        username: Joi.string(),
        password: Joi.string(),
        phone: Joi.string(),
        admin: Joi.boolean()
      }).unknown(false)
    }
  }

  get login() {
    return {
      body: Joi.object().keys({
        username: Joi.string().required(),
        password: Joi.string().required()
      }).unknown(false)
    }
  }
}

module.exports = new UserValidator()
