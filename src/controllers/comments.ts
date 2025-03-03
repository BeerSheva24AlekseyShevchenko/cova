import { Request, Response } from 'express';
import { Middleware, Controller, Delete, Get, Post, Put } from '../core/controller';
import { CommentsSchema } from '../validation/comments';
import * as Services from '../services/comments';
import { EUserRole, Permissions } from '../core/roles';
import { AppError } from '../core/errors';
import { Schema } from '../core/validation';

@Controller('/api/comments')
export class CommentsController {
  @Get('/movies/:movieId')
  @Permissions([EUserRole.USER, EUserRole.PREMIUM_USER, EUserRole.ADMIN])
  @Schema(CommentsSchema.getMovieComments)
  async getMostRated(req: Request, res: Response) {
    const data = await Services.getMovieComments(req.params.movieId);
    res.json(data);
  }

  @Get('/users/:email')
  @Permissions([EUserRole.USER, EUserRole.PREMIUM_USER, EUserRole.ADMIN])
  @Schema(CommentsSchema.getUserComments)
  async getUserComments(req: Request, res: Response) {
    const data = await Services.getUserComments(req.params.email);
    res.json(data);
  }

  @Put('/:commentId')
  @Permissions([EUserRole.PREMIUM_USER])
  @Middleware(checkOwner)
  @Schema(CommentsSchema.updateComment)
  async updateComment(req: Request, res: Response) {
    const data = await Services.updateComment(req.params.commentId, req.body.text);
    res.json(data);
  }

  @Delete('/:commentId')
  @Permissions([EUserRole.PREMIUM_USER, EUserRole.ADMIN])
  @Middleware(checkOwner)
  @Schema(CommentsSchema.deleteComment)
  async deleteComment(req: Request, res: Response) {
    const data = await Services.deleteComment(req.params.commentId);
    res.json(data);
  }

  @Post('/')
  @Permissions([EUserRole.PREMIUM_USER])
  @Schema(CommentsSchema.addComment)
  async addComment(req: Request, res: Response) {
    const { movieId, text } = req.body;
    const data = await Services.addComment({ movieId, text, email: req.user });
    res.json(data);
  }
}

async function checkOwner(req: Request) {
  if (req.role !== EUserRole.ADMIN) {
    const comment = await Services.getComment(req.params.commentId)
    if (comment?.email !== req.user) {
        throw new AppError('Forbidden', 403)
    }
  }
};
