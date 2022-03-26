import { Router } from 'express';
import SearchController from '@controllers/search.controller';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@/middlewares/validation.middleware';
import { SeachQueryDto } from '@/dtos/Search.dto';
import { SearchLimiter } from '@/middlewares/ratelimit.middleware';

class UsersRoute implements Routes {
  public path = '/search';
  public router = Router();
  public seachController = new SearchController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, validationMiddleware(SeachQueryDto, 'query'), SearchLimiter, this.seachController.searchByQuery);
  }
}

export default UsersRoute;
