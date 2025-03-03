import Joi, { ObjectSchema } from "joi";
import { joiPasswordExtendCore } from "joi-password";
import { EUserRole } from "./roles";
import { AppError } from "./errors";
import { Request } from "express";
import { Middleware } from "./controller";

export interface IRequestSchema {
  params?: ObjectSchema;
  body?: ObjectSchema;
  query?: ObjectSchema;
}

export const CHECKS = {
  id: Joi.string().regex(/^[0-9a-fA-F]{24}$/),
  str: Joi.string(),
  strAsInt: Joi.string().regex(/^\d+$/),
  strAsYear: Joi.string().regex(/^\d{4}$/),
  int: Joi.number().integer(),
  rating: Joi.number().integer().min(1).max(10),
  email: Joi.string().email(),
  bool: Joi.boolean(),
  fullName: Joi.string().regex(/^[A-Za-zА-Яа-я]+ [A-Za-zА-Яа-я]+$/),
  password: Joi.extend(joiPasswordExtendCore)
    .string()
    .min(8)
    .minOfSpecialCharacters(1)
    .minOfLowercase(1)
    .minOfUppercase(1)
    .minOfNumeric(1)
    .noWhiteSpaces()
    .onlyLatinCharacters()
    .doesNotInclude(["password", "12345"]),
  role: Joi.string().valid(...Object.values(EUserRole)),
};


const validate = (schema: IRequestSchema) =>
  (req: Request) => {
    const errors: string[] = [];

    (Object.keys(schema) as (keyof IRequestSchema)[]).forEach((key) => {
      const result = schema?.[key]?.validate(req[key]);
      if (result?.error) {
        const message = result.error.details.map((i) => i.message).join(',');
        errors.push(message);
      }
    });

    if (errors.length > 0) {
      throw new AppError(errors.join('; '), 400);
    }
  };

export const Schema = (schema: IRequestSchema) => {
  return Middleware(validate(schema));
};