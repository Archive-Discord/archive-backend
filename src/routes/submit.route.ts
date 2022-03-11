import { Router } from 'express';
import SubmitController from '@controllers/submit.controller';
import { Routes } from '@interfaces/routes.interface';
import authMiddleware, { authReviewerMiddleware } from '@/middlewares/auth.middleware';
import validationMiddleware from '@/middlewares/validation.middleware';
import { ServerDenyDto, SubmitServerDto } from '@/dtos/ServerSubmit.dto';
import { ServerComentDeleteDto, ServerComentDto } from '@/dtos/ServerComent.dto';

class UsersRoute implements Routes {
  public path = '/submit';
  public router = Router();
  public serversController = new SubmitController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/submitlist`, authReviewerMiddleware, this.serversController.getSubmitList);
    this.router.get(`${this.path}/submitlist/server/:id`, authReviewerMiddleware, this.serversController.getSubmitServer);
    this.router.patch(`${this.path}/submitlist/server/:id/accept`, authReviewerMiddleware, this.serversController.SubmitAcceptServer);
    this.router.patch(`${this.path}/submitlist/server/:id/deny`, authReviewerMiddleware, validationMiddleware(ServerDenyDto, 'body'), this.serversController.SubmitDenyServer);
  }
}

export default UsersRoute;
