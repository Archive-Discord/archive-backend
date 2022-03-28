import { Router } from 'express';
import ServerController from '@controllers/server.controller';
import botController from '@controllers/bot.controller';
import { Routes } from '@interfaces/routes.interface';
import authMiddleware, { authBotMiddleware } from '@/middlewares/auth.middleware';
import validationMiddleware from '@/middlewares/validation.middleware';
import { SubmitServerDto } from '@/dtos/ServerSubmit.dto';
import { ServerComentDeleteDto, ServerComentDto, ServerVerifyDto } from '@/dtos/ServerComent.dto';
import { BotComentDeleteDto, BotComentDto, BotFindDto, BotServerCountDto, BotTokenUpdateDto, BotVerifyDto, SubmitBotDto } from '@/dtos/BotSubmit.dto';
import { BotServerUpdateLimiter, BotUserLikeLimiter } from '@/middlewares/ratelimit.middleware';

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
    this.router.get(`${this.path}/:id/like/:user_id`, BotUserLikeLimiter, authBotMiddleware, this.botsController.likeBotUserCheck);
    this.router.post(`${this.path}/:id/server`, BotServerUpdateLimiter, authBotMiddleware, validationMiddleware(BotServerCountDto, 'body'), this.botsController.UpdateBotServer);
    this.router.post(`${this.path}/:id/refreshtoken`, BotServerUpdateLimiter, authMiddleware, this.botsController.RefreshBotToken);
    this.router.post(`${this.path}/:id/edit`, validationMiddleware(SubmitBotDto, 'body'), authMiddleware, this.botsController.UpdateBotData);
    this.router.get(`${this.path}/:id/owner`, authMiddleware, this.botsController.getBotByOwner);
    this.router.get(`${this.path}/:id/comments`, this.botsController.getBotComment);
    this.router.post(`${this.path}/:id/comments`,authMiddleware, validationMiddleware(BotComentDto, 'body'), this.botsController.postBotComment);
    this.router.delete(`${this.path}/:id/comments`,authMiddleware, validationMiddleware(BotComentDeleteDto, 'body'), this.botsController.deleteBotComment);
  }
}

export default UsersRoute;
