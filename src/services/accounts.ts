import { connectToDB } from '../core/db';
import { checkHash, getHash, getJwt } from '../core/securityUtils';
import { AppError } from '../core/errors';
import { EUserRole } from '../core/roles';
import { getExpiration } from '../core/timeUtils';
import config from 'config';

const createUser = (data: any, role: EUserRole) => ({
  _id: data.email,
  name: data.name,
  role,
  hashPassword: getHash(data.password),
  expiration: Date.now() + getExpiration(config.get<string>("accounting.expiredIn")),
  blocked: false
});

export const addAccount = async (data: any) => {
  const db = await connectToDB();
  const newUser = createUser(data, EUserRole.USER);
  const result = await db.collection('users').insertOne(newUser).catch((err) => {
    if (err.code === 11000) throw new AppError('Email already exists', 409);
    throw err;
  });
  if(!result) throw new AppError('Failed to add user', 500);

  return newUser;
};

export const addAdminAccount = async (data: any) => {
  const db = await connectToDB();
  const newUser = createUser(data, EUserRole.ADMIN);
  const result = await db.collection('users').insertOne(newUser).catch((err) => {
    if (err.code === 11000) throw new AppError('Email already exists', 409);
    throw err;
  });
  if(!result) throw new AppError('Failed to add user', 500);

  return newUser;
};

const updateUser = async (email: string, data: any) => {
  const db = await connectToDB();
  const result = await db.collection('users').findOneAndUpdate(
    { _id: email as any },
    { $set: data },
    { returnDocument: 'after' }
  );
  if(!result) throw new AppError('User not found', 404);
  return result;
};

export const setRole = (email: string, role: string) =>
  updateUser(email, { role });

export const updatePassword = (email: string, password: string) =>
  updateUser(email, { hashPassword: getHash(password) });

export const getAccount = async (email: string) => {
  const db = await connectToDB();
  const user = await db.collection('users').findOne({ _id: email as any });
  if (!user) throw new AppError('User not found', 404);
  return user;
};

export const blockAccount = (email: string) =>
  updateUser(email, { blocked: true });

export const unblockAccount = (email: string) =>
  updateUser(email, { blocked: false });

export const deleteAccount = async (email: string) => {
  const db = await connectToDB();
  const result = await db.collection('users').findOneAndDelete({ _id: email as any });
  if(!result) throw new AppError('User not found', 404);
  return {};
};

export const login = async (email: string, password: string) => {
  const db = await connectToDB();
  const user = await db.collection('users').findOne({ _id: email as any });

  if (!user || !await checkHash(password, user.hashPassword)) {
    throw new AppError('Invalid email or password', 400);
  }

  if (user.blocked) {
    throw new AppError('User blocked', 401);
  }

  if (Date.now() > user.expiration) {
    throw new AppError('Account password is expired', 400);
  }

  return { token: getJwt(user) };
};

export const checkRequestLimit = async (email: string) => {
  const db = await connectToDB();
  const result = await db.collection('users').findOne({ _id: email as any });
  let requestCount = result?.requestCount ?? 0;
  let requestPeriodStart = result?.requestPeriodStart ?? 0;

  const limitCount = config.get<number>("userLimits.requestCount");
  const limitPeriod = config.get<string>("userLimits.requestCountPeriod");
  const limitTime = getExpiration(limitPeriod);
  const now = Date.now();

  if (requestPeriodStart + limitTime < now) {
    requestCount = 1;
    requestPeriodStart = now;
  } else if (requestCount < limitCount) {
    requestCount++;
  } else {
    throw new AppError('Request limit exceeded', 429);
  }

  db.collection('users').updateOne(
    { _id: email as any },
    { $set: { requestCount, requestPeriodStart } }
  );
};

export const checkBlocked = async (email: string) => {
  const db = await connectToDB();
  const result = await db.collection('users').findOne({ _id: email as any });
  if(result?.blocked) throw new AppError('User blocked', 401);
};
