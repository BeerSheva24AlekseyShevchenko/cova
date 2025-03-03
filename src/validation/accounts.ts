import Joi from "joi";
import { CHECKS } from "../core/validation";

export const AccountsSchema = {
  addAccount: {
    body: Joi.object({
      email: CHECKS.email.required(),
      name: CHECKS.fullName.required(),
      password: CHECKS.password.required(),
    }),
  },

  addAdminAccount: {
    body: Joi.object({
      email: CHECKS.email.required(),
      name: CHECKS.fullName.required(),
      password: CHECKS.password.required(),
    }),
  },

  setRole: {
    params: Joi.object({
      email: CHECKS.email.required(),
    }),
    body: Joi.object({
      role: CHECKS.role.required(),
    }),
  },

  updatePassword: {
    params: Joi.object({
      email: CHECKS.email.required(),
    }),
    body: Joi.object({
      password: CHECKS.password.required(),
    }),
  },

  getAccount: {
    params: Joi.object({
      email: CHECKS.email.required(),
    }),
  },

  blockAccount: {
    params: Joi.object({
      email: CHECKS.email.required(),
    }),
  },

  unblockAccount: {
    params: Joi.object({
      email: CHECKS.email.required(),
    }),
  },

  deleteAccount: {
    params: Joi.object({
      email: CHECKS.email.required(),
    }),
  },

  login: {
    body: Joi.object({
      email: CHECKS.email.required(),
      password: CHECKS.str.required()
    }),
  },
} as const;
