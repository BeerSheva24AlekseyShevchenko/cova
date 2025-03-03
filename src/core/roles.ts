import { Request } from "express";
import { AppError } from "./errors";
import { Middleware } from "./controller";

export enum EUserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  PREMIUM_USER = 'PREMIUM_USER'
}

const checkRole = (roles: EUserRole[]) =>
  (req: Request) => {
    if (!roles.includes(req.role!)) {
      throw new AppError('Forbidden', 403);
    }
  };

export const Permissions = (value: EUserRole | EUserRole[]) => {
  const roles = Array.isArray(value) ? value : [value];
  return Middleware(checkRole(roles));
};