import { Request, Response } from 'express';
import { EUserRole, Permissions } from '../core/roles';
import { Middleware, Controller, Delete, Get, Post, Put } from '../core/controller';
import { FavoritesSchema } from '../validation/favorites';
import * as Services from '../services/favorites';
import { AppError } from '../core/errors';
import { Schema } from '../core/validation';

@Controller('/api/favorites')
export class FavoritesController {
  @Get('/')
  @Permissions(EUserRole.PREMIUM_USER)
  async getUserFavoriteMovies(req: Request, res: Response) {
    const data = await Services.getUserFavoriteMovies(req.user!);
    res.json(data);
  }

  @Put('/:id')
  @Permissions(EUserRole.PREMIUM_USER)
  @Middleware(checkOwner)
  @Schema(FavoritesSchema.updateFavorite)
  async updateFavorite(req: Request, res: Response) {
    const { viewed, feedBack } = req.body;
    const data = await Services.updateFavorite(req.params.id, { viewed, feedBack });
    res.json(data);
  }

  @Delete('/:id')
  @Permissions(EUserRole.PREMIUM_USER)
  @Middleware(checkOwner)
  @Schema(FavoritesSchema.deleteFavorite)
  async deleteFavorite(req: Request, res: Response) {
    const data = await Services.deleteFavorite(req.params.id);
    res.json(data);
  }

  @Post('/')
  @Permissions(EUserRole.PREMIUM_USER)
  @Schema(FavoritesSchema.addFavorite)
  async addFavorite(req: Request, res: Response) {
    const { movieId, feedBack, viewed } = req.body;
    const data = await Services.addFavorite(req.user!, { movieId, feedBack, viewed });
    res.json(data);
  }
}

async function checkOwner(req: Request) {
  const favorite = await Services.getFavorite(req.params.id);
  if (favorite?.email !== req.user) {
    throw new AppError('Forbidden', 403)
  }
};
