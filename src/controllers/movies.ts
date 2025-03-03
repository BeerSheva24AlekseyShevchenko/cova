import { Request, Response } from 'express';
import { Controller, Get, Put, Middleware } from '../core/controller';
import { EUserRole, Permissions } from '../core/roles';
import { MoviesSchema } from '../validation/movies';
import * as Services from '../services/movies';
import { checkRequestLimit } from '../services/accounts';
import { Schema } from '../core/validation';

@Controller('/api/movies')
export class MoviesController {
  @Get('/mostRated')
  @Permissions([EUserRole.USER, EUserRole.PREMIUM_USER])
  @Middleware(checkUserRequestLimit)
  @Schema(MoviesSchema.getMostRated)
  async getMostRated(req: Request, res: Response) {
    const data = await Services.getMostRated(req.query);
    res.json(data);
  }

  @Get('/mostCommented')
  @Permissions([EUserRole.USER, EUserRole.PREMIUM_USER])
  @Middleware(checkUserRequestLimit)
  @Schema(MoviesSchema.getMostCommented)
  async getMostCommented(req: Request, res: Response) {
    const data = await Services.getMostCommented(req.query);
    res.json(data);
  }

  @Put('/rate')
  @Permissions(EUserRole.PREMIUM_USER)
  @Schema(MoviesSchema.addRate)
  async addRate(req: Request, res: Response) {
    const data = await Services.addRate(req.body.id, req.body.rating);
    res.json(data);
  };

  @Get('/:id')
  @Permissions([EUserRole.USER, EUserRole.PREMIUM_USER])
  @Middleware(checkUserRequestLimit)
  @Schema(MoviesSchema.getMovie)
  async getMovie(req: Request, res: Response) {
    const data = await Services.getMovie(req.params.id);
    res.json(data);
  }
}

async function checkUserRequestLimit(req: Request) {
  if (req.role === EUserRole.USER) {
    await checkRequestLimit(req.user!);
  }
}
