import { MongoClient, Db } from 'mongodb';

const DB_NAME = 'sample_mflix';

let connection: Promise<Db>;

export const connectToDB = (): Promise<Db> => {
  if (!connection) {
    if (!process.env.MONGO_URI) throw new Error();

    connection = MongoClient.connect(process.env.MONGO_URI).then((value) => value.db(DB_NAME));
  }

  return connection;
};