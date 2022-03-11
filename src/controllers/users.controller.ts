import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from '@dtos/users.dto';
import { FindeUserDiscordUser, User } from '@interfaces/users.interface';
import userService from '@services/users.service';

class UsersController {
  public userService = new userService();

  public getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findOneUserData: User = await this.userService.findUserById(req.params.id);

      res.status(200).json({ status: 200, data: findOneUserData, message: '요청을 성공적으로 실행했습니다.' });
    } catch (error) {
      next(error);
    }
  };

  public getUserByme = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findOneUserData: FindeUserDiscordUser = await this.userService.findUserByMe(req);

      res.status(200).json({ status: 200, data: findOneUserData, message: '요청을 성공적으로 실행했습니다.' });
    } catch (error) {
      next(error);
    }
  }
}

export default UsersController;
