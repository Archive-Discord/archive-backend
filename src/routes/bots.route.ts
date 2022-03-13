import { Router } from 'express';
import ServerController from '@controllers/server.controller';
import botController from '@controllers/bot.controller';
import { Routes } from '@interfaces/routes.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import validationMiddleware from '@/middlewares/validation.middleware';
import { SubmitServerDto } from '@/dtos/ServerSubmit.dto';
import { ServerComentDeleteDto, ServerComentDto, ServerVerifyDto } from '@/dtos/ServerComent.dto';
import { BotComentDeleteDto, BotComentDto, BotFindDto, BotVerifyDto, SubmitBotDto } from '@/dtos/BotSubmit.dto';

class UsersRoute implements Routes {
  public path = '/bots';
  public router = Router();
  public botsController = new botController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.botsController.getBots);
    this.router.post(`${this.path}/submit`, authMiddleware, validationMiddleware(SubmitBotDto, 'body'), this.botsController.addBot);
    this.router.post(`${this.path}/submit/find`, authMiddleware, validationMiddleware(BotFindDto, 'body'), this.botsController.getSubmitBotById);
    this.router.get(`${this.path}/:id`, this.botsController.getBotById);
    this.router.post(`${this.path}/:id/like`, authMiddleware, validationMiddleware(BotVerifyDto, 'body'), this.botsController.likeBot);
    this.router.get(`${this.path}/:id/comments`, this.botsController.getBotComment);
    this.router.post(`${this.path}/:id/comments`,authMiddleware, validationMiddleware(BotComentDto, 'body'), this.botsController.postBotComment);
    this.router.delete(`${this.path}/:id/comments`,authMiddleware, validationMiddleware(BotComentDeleteDto, 'body'), this.botsController.deleteBotComment);
  }
}

export default UsersRoute;
