import { Request, Response } from 'express';
import { Middleware, Controller, Delete, Get, Patch, Post } from '../core/controller';
import { EUserRole, Permissions } from '../core/roles';
import { AccountsSchema } from '../validation/accounts';
import * as Services from '../services/accounts';
import { AppError } from '../core/errors';
import { Schema } from '../core/validation';

@Controller('/api/accounts')
export class AccountsController {

  @Post('/')
  @Schema(AccountsSchema.addAccount)
  async addAccount(req: Request, res: Response) {
    const { email, name, password } = req.body;
    const data = await Services.addAccount({ email, name, password });
    res.json(data);
  }

  @Post('/login')
  @Schema(AccountsSchema.login)
  async login(req: Request, res: Response) {
    const data = await Services.login(req.body.email, req.body.password);
    res.json(data);
  }

  @Post('/admin')
  @Permissions(EUserRole.ADMIN)
  @Schema(AccountsSchema.addAdminAccount)
  async addAdminAccount(req: Request, res: Response) {
    const { email, name, password } = req.body;
    const data = await Services.addAdminAccount({ email, name, password });
    res.json(data);
  }

  @Get('/:email')
  @Permissions([EUserRole.ADMIN, EUserRole.USER, EUserRole.PREMIUM_USER])
  @Middleware(checkOwner)
  @Schema(AccountsSchema.getAccount)
  async getAccount(req: Request, res: Response) {
    const data = await Services.getAccount(req.params.email);
    res.json(data);
  }

  @Delete('/:email')
  @Permissions([EUserRole.ADMIN, EUserRole.USER, EUserRole.PREMIUM_USER])
  @Middleware(checkOwner)
  @Schema(AccountsSchema.deleteAccount)
  async deleteAccount(req: Request, res: Response) {
    const data = await Services.deleteAccount(req.params.email);
    res.json(data);
  }

  @Patch('/:email/role')
  @Permissions(EUserRole.ADMIN)
  @Schema(AccountsSchema.setRole)
  async setRole(req: Request, res: Response) {
    const data = await Services.setRole(req.params.email, req.body.role);
    res.json(data);
  }

  @Patch('/:email/password')
  @Permissions([EUserRole.ADMIN, EUserRole.USER, EUserRole.PREMIUM_USER])
  @Middleware(checkOwner)
  @Schema(AccountsSchema.updatePassword)
  async updatePassword(req: Request, res: Response) {
    const data = await Services.updatePassword(req.params.email, req.body.password);
    res.json(data);
  }

  @Patch('/:email/block')
  @Permissions(EUserRole.ADMIN)
  @Schema(AccountsSchema.blockAccount)
  async blockAccount(req: Request, res: Response) {
    const data = await Services.blockAccount(req.params.email);
    res.json(data);
  }

  @Patch('/:email/unblock')
  @Permissions(EUserRole.ADMIN)
  @Schema(AccountsSchema.unblockAccount)
  async unblockAccount(req: Request, res: Response) {
    const data = await Services.unblockAccount(req.params.email);
    res.json(data);
  }
}

async function checkOwner(req: Request) {
  if (req.role !== EUserRole.ADMIN && req.user !== req.params.email) {
    throw new AppError('Forbidden', 403);
  }
}
