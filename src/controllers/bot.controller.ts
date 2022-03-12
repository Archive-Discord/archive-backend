import { NextFunction, Request, Response } from 'express';
import cache from "@utils/Cache";
import botService from '@/services/bots.service';
import { User } from '@/interfaces/users.interface';
import { RequestWithUser } from '@/interfaces/auth.interface';

class botsController {
  public botService = new botService();

  public getSubmitBotById = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      let cacheData = cache.get(`submit_bot_${req.params.id}`);
      if(cacheData) {
        res.status(200).json({ status: 200, data: cacheData, message: '요청을 성공적으로 실행했습니다.' });
      } else {
        const getSubmitBotUser: User = await this.botService.findSubmitBotById(req.body.id);
        res.status(200).json({ status: 200 ,data: getSubmitBotUser, message: '요청을 성공적으로 실행했습니다.' });
        cache.set(`submit_bot_${req.params.id}`, getSubmitBotUser, 18000);
      }
    } catch (error) {
      next(error);
    }
  };

  public addBot = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const addBotData = await this.botService.addBot(req);
      res.status(200).json({ data: addBotData, message: '신청을 성공적으로 완료했습니다!' });
    } catch (error) {
      next(error);
    }
  }
}

export default botsController;
