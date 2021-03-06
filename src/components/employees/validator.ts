import Joi from "joi";
import { JOIResult } from "../../types";

export interface IEmployeeValidator {
  createEmployee: () => JOIResult;
  updateEmployee: () => JOIResult;
  login: () => JOIResult;
}

/**
 * Static validation class for the employees routes
 */
export const EmployeeValidator: IEmployeeValidator = {
  createEmployee() {
    return {
      body: Joi.object()
        .keys({
          admin: Joi.boolean(),
          first_name: Joi.string().required(),
          last_name: Joi.string().required(),
          password: Joi.string().required(),
          phone: Joi.string(),
          username: Joi.string().required(),
        })
        .unknown(false),
    };
  },
  updateEmployee() {
    return {
      body: Joi.object()
        .keys({
          admin: Joi.boolean(),
          first_name: Joi.string(),
          last_name: Joi.string(),
          password: Joi.string(),
          phone: Joi.string(),
          username: Joi.string(),
        })
        .unknown(false),
    };
  },
  login() {
    return {
      body: Joi.object()
        .keys({
          password: Joi.string().required(),
          username: Joi.string().required(),
        })
        .unknown(false),
    };
  },
};
