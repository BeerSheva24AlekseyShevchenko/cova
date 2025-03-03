import jwt, { JwtPayload } from 'jsonwebtoken';
import config from 'config';
import bcrypt from 'bcrypt';
import { getExpiration } from './timeUtils';

export const getHash = (password: string) => bcrypt.hashSync(
  password,
  config.get("accounting.salt_rounds")
);

export const checkHash = (password: string, hash: string) =>
  bcrypt.compare(password, hash);

export const getJwt = (account: any) => {
  if (!process.env.JWT_SECRET) throw new Error();

  return jwt.sign(
    { role: account.role },
    process.env.JWT_SECRET,
    {
      subject: account._id,
      expiresIn: getExpiration(config.get<string>("accounting.expiredIn")),
    }
  );
};

export const verifyJwt = (token: string): JwtPayload => {
  if (!process.env.JWT_SECRET) throw new Error();

  return jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
}

