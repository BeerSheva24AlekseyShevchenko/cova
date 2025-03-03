import { verifyJwt } from "../core/securityUtils";
import { EUserRole } from "../core/roles";

declare global {
  namespace Express {
    interface Request {
      user?: string;
      role?: EUserRole;
      authType?: 'basic' | 'jwt'
    }
  }
}

export function getUserByJWT(token: string) {
  const payload = verifyJwt(token);
  return { email: payload.sub, role: payload.role };
}

export function getUserByCredentials (credentials: string) {
  const userNamePassword = Buffer.from(credentials, "base64").toString("utf-8");
  const [login, password] = userNamePassword.split(":");

  if (login === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    return { email: process.env.ADMIN_USERNAME, role: EUserRole.ADMIN };
  }
};
