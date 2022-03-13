import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from '@dtos/users.dto';
import { FindeUserDiscordUser, User } from '@interfaces/users.interface';
import SubmitService from '@/services/submitlists.service';
import { submitList } from '@/interfaces/submitList.interface';
import { FindServerData } from '@/interfaces/servers.interface';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { FindbotData } from '@/interfaces/bots.interface';

class SubmitController {
  public submitService = new SubmitService();

  public getSubmitList = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findSubmitData: submitList[] = await this.submitService.findSubmitList();

      res.status(200).json({ status: 200, data: findSubmitData, message: '요청을 성공적으로 실행했습니다.' });
    } catch (error) {
      next(error);
    }
  }

  public getSubmitServer = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findSubmitData: FindServerData = await this.submitService.findSubmitServer(req.params.id);

      res.status(200).json({ status: 200, data: findSubmitData, message: '요청을 성공적으로 실행했습니다.' });
    } catch (error) {
      next(error);
    }
  }

  public SubmitAcceptServer = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.submitService.AcceptSubmitServer(req.params.id, req.user);

      res.status(200).json({ status: 200, message: '요청을 성공적으로 실행했습니다.' });
    } catch (error) {
      next(error);
    }
  }

  public SubmitDenyServer = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.submitService.DenySubmitServer(req.params.id, req.user, req.body.reason);

      res.status(200).json({ status: 200, message: '요청을 성공적으로 실행했습니다.' });
    } catch (error) {
      next(error);
    }
  }

  public getSubmitBot = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findSubmitData: FindbotData = await this.submitService.findSubmitBot(req.params.id);

      res.status(200).json({ status: 200, data: findSubmitData, message: '요청을 성공적으로 실행했습니다.' });
    } catch (error) {
      next(error);
    }
  }

  public SubmitDenyBot = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.submitService.DenySubmitBot(req.params.id, req.user, req.body.reason);
      res.status(200).json({ status: 200, message: '요청을 성공적으로 실행했습니다.' });
    } catch (error) {
      next(error);
    }
  }

  public SubmitAcceptBot = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.submitService.AcceptSubmitBot(req.params.id, req.user);

      res.status(200).json({ status: 200, message: '요청을 성공적으로 실행했습니다.' });
    } catch (error) {
      next(error);
    }
  }
}

export default SubmitController;
