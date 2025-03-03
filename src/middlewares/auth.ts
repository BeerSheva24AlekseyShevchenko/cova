import { NextFunction, Request, Response } from "express";
import { getUserByCredentials, getUserByJWT } from "../core/authUtils";
import { checkBlocked } from "../services/accounts";

const BEARER = "Bearer ";
const BASIC = "Basic ";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.header("Authorization");

  if (authHeader) {
    if (authHeader.startsWith(BEARER)) {
      const token = authHeader.substring(BEARER.length);
      try {
        const user = getUserByJWT(token);
        checkBlocked(user?.email!);
        req.user = user?.email;
        req.role = user?.role;
        req.authType = 'jwt';
      } catch (error) {}
    } else if (authHeader.startsWith(BASIC)) {
      const credential = authHeader.substring(BASIC.length);
      const user = getUserByCredentials(credential);
      req.user = user?.email;
      req.role = user?.role;
      req.authType = 'basic'
    }
  }
  next();
};