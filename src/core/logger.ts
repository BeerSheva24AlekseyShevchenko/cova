import morgan from 'morgan';
import config from 'config';
import { createStream } from 'rotating-file-stream';
import { Request, Response } from 'express';
import fs from 'fs';
import winston from 'winston';

const getStreamToFile = (fileName: string, directory: string) =>
  createStream(fileName, {
    interval: '1d',
    path: directory,
  });

const getStream = (fileName: string, directory: string | null) =>
  directory ? getStreamToFile(fileName, directory) : process.stdout;
  

export const createRequestLogger = () => {
  const loggers = [];
  const type = config.get<string>("morgan.type");
  const directory = config.get<string | null>("morgan.directory");

  if (directory && !fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  loggers.push(morgan(type, { stream: getStream('data.log', directory) }));

  if (process.env.NODE_ENV === 'production') {
    loggers.push(morgan(type, {
      stream: getStream('auth-errors.log', directory),
      skip: (req: Request, res: Response) => res.statusCode !== 401 && res.statusCode !== 403,
    }));
  }

  return loggers;
};

export const logger = winston.createLogger({
  level:  process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${message}`;
    })
  ),
  transports: [new winston.transports.Console()],
});
