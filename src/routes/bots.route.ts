import { Router } from 'express';
import ServerController from '@controllers/server.controller';
import botController from '@controllers/bot.controller';
import { Routes } from '@interfaces/routes.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import validationMiddleware from '@/middlewares/validation.middleware';
import { SubmitServerDto } from '@/dtos/ServerSubmit.dto';
import { ServerComentDeleteDto, ServerComentDto, ServerVerifyDto } from '@/dtos/ServerComent.dto';
import { BotFindDto, SubmitBotDto } from '@/dtos/BotSubmit.dto';

class UsersRoute implements Routes {
  public path = '/bots';
  public router = Router();
  public botsController = new botController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/submit`, authMiddleware, validationMiddleware(SubmitBotDto, 'body'), this.botsController.addBot);
    this.router.post(`${this.path}/submit/find`, authMiddleware, validationMiddleware(BotFindDto, 'body'), this.botsController.getSubmitBotById);
  }
}

export default UsersRoute;
