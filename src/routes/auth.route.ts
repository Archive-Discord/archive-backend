import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import AuthController from '@/controllers/auth.controller';
import authMiddleware from '@/middlewares/auth.middleware';

class UsersRoute implements Routes {
  public path = '/auth';
  public router = Router();
  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/discord/callback`, this.authController.logIn);
    this.router.get(`${this.path}/discord`, this.authController.logInUrl);
    this.router.get(`${this.path}/logout`, this.authController.logOut);
  }
}

export default UsersRoute;
