import Joi from 'joi';
import { JOIResult } from '../../types';

export interface IUserValidator {
  createUser: () => JOIResult;
  updateUser: () => JOIResult;
  login: () => JOIResult;
}

export const UserValidator: IUserValidator = {
  createUser() {
    return {
      body: Joi.object()
        .keys({
          first_name: Joi.string().required(),
          last_name: Joi.string().required(),
          username: Joi.string().required(),
          password: Joi.string().required(),
          phone: Joi.string(),
          admin: Joi.boolean()
        })
        .unknown(false)
    };
  },
  updateUser() {
    return {
      body: Joi.object()
        .keys({
          first_name: Joi.string(),
          last_name: Joi.string(),
          username: Joi.string(),
          password: Joi.string(),
          phone: Joi.string(),
          admin: Joi.boolean()
        })
        .unknown(false)
    };
  },
  login() {
    return {
      body: Joi.object()
        .keys({
          username: Joi.string().required(),
          password: Joi.string().required()
        })
        .unknown(false)
    };
  }
};
