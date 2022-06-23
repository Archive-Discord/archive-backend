import { Router } from 'express';
import ServerController from '@controllers/server.controller';
import { Routes } from '@interfaces/routes.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import validationMiddleware from '@/middlewares/validation.middleware';
import { SubmitServerDto, ServerReportDto } from '@/dtos/ServerSubmit.dto';
import { ServerComentDeleteDto, ServerComentDto, ServerVerifyDto } from '@/dtos/ServerComent.dto';

class UsersRoute implements Routes {
  public path = '/servers';
  public router = Router();
  public serversController = new ServerController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.serversController.getServers);
    this.router.get(`${this.path}/@me`, authMiddleware, this.serversController.getServersMe);
    this.router.post(`${this.path}/submit`, authMiddleware, validationMiddleware(SubmitServerDto, 'body'), this.serversController.addServer);
    this.router.get(`${this.path}/:id`, this.serversController.getServerById);
    this.router.post(`${this.path}/:id/report`, authMiddleware, validationMiddleware(ServerReportDto, 'body'),this.serversController.reportServer);
    this.router.post(`${this.path}/:id/invite`, authMiddleware, validationMiddleware(ServerVerifyDto, 'body'), this.serversController.inviteServer);
    this.router.post(`${this.path}/:id/like`, authMiddleware, validationMiddleware(ServerVerifyDto, 'body'), this.serversController.likeServer);
    this.router.get(`${this.path}/:id/owner`, authMiddleware, this.serversController.getServerByOwner);
    this.router.get(`${this.path}/:id/comments`, this.serversController.getServerComments);
    this.router.post(`${this.path}/:id/comments`,authMiddleware, validationMiddleware(ServerComentDto, 'body'), this.serversController.postServerComments);
    this.router.delete(`${this.path}/:id/comments`,authMiddleware, validationMiddleware(ServerComentDeleteDto, 'body'), this.serversController.deleteServerComments);
  }
}

export default UsersRoute;
