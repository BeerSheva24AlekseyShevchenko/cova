import express from 'express';
import { connectToDB } from './core/db';
import { errorHandler, notFoundHandler } from './middlewares/errors';
import { authenticate } from './middlewares/auth';
import { injectControllers } from './core/controller';
import { MoviesController } from './controllers/movies';
import { AccountsController } from './controllers/accounts';
import { CommentsController } from './controllers/comments';
import { FavoritesController } from './controllers/favorites';
import { createRequestLogger, logger } from './core/logger';
import dotenv from 'dotenv';

const app = express();
const port = 3000;
dotenv.config();

app.use(express.json());
app.use(createRequestLogger());
app.use(authenticate);

connectToDB();

injectControllers(app, [
  MoviesController,
  AccountsController,
  CommentsController,
  FavoritesController,
]);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(port, () => {
  logger.info(`Server started ${port}`);
});

export default app;