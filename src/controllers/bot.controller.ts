import { NextFunction, Request, Response } from 'express';
import cache from "@utils/Cache";
import botService from '@/services/bots.service';
import { User } from '@/interfaces/users.interface';
import { RequestWithBot, RequestWithBotUserAuth, RequestWithUser } from '@/interfaces/auth.interface';
import { FindBotDataList, FindbotData, FindBotCommentsDataList } from '@/interfaces/bots.interface';

class botsController {
  public botService = new botService();

  public getBotById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      let cacheData = cache.get(`bot_${req.params.id}`);
      if(cacheData) {
        res.status(200).json({ status: 200, data: cacheData, message: '요청을 성공적으로 실행했습니다.' });
      } else {
        const findOneServerData: FindbotData = await this.botService.findBotById(req.params.id);
        res.status(200).json({ status: 200 ,data: findOneServerData, message: '요청을 성공적으로 실행했습니다.' });
        cache.set(`bot_${req.params.id}`, findOneServerData, 1800);
      }
    } catch (error) {
      next(error);
    }
  }

  public getBots = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      // @ts-ignore
      if(!req.query.page) req.query.page = 1;
      // @ts-ignore
      let cacheData = cache.get(`bots_${Number(req.query.page)}`);
      if(cacheData) {
        res.status(200).json({ status: 200, data: cacheData, message: '요청을 성공적으로 실행했습니다.' });
      } else {
        const findOneServerData: FindBotDataList = await this.botService.findbots(Number(req.query.page));
        res.status(200).json({ status: 200, data: findOneServerData, message: '요청을 성공적으로 실행했습니다.' });
        cache.set(`bots_${Number(req.query.page)}`, findOneServerData);
      }
    } catch (error) {
      next(error);
    }
  }

  public getSubmitBotById = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      let cacheData = cache.get(`submit_bot_${req.body.id}`);
      if(cacheData) {
        res.status(200).json({ status: 200, data: cacheData, message: '요청을 성공적으로 실행했습니다.' });
      } else {
        const getSubmitBotUser: User = await this.botService.findSubmitBotById(req.body.id);
        res.status(200).json({ status: 200 ,data: getSubmitBotUser, message: '요청을 성공적으로 실행했습니다.' });
        cache.set(`submit_bot_${req.body.id}`, getSubmitBotUser, 18000);
      }
    } catch (error) {
      next(error);
    }
  };

  public addBot = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const addBotData = await this.botService.addBot(req);
      res.status(200).json({ status: 200, data: addBotData, message: '신청을 성공적으로 완료했습니다!' });
    } catch (error) {
      next(error);
    }
  }

  public likeBot = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const likeBotData = await this.botService.likeBot(req);
      res.status(200).json({ status: 200, data: likeBotData, message: '봇에 좋아요를 추가했습니다!' });
    } catch (error) {
      next(error);
    }
  }

  public likeBotUserCheck = async (req: RequestWithBot, res: Response, next: NextFunction): Promise<void> => {
    try {
      const likeBotData = await this.botService.likeBotUserCheck(req);
      res.status(200).json({ status: 200, data: likeBotData, message: '요청을 성공적으로 실행했습니다.' });
    } catch (error) {
      next(error);
    }
  }

  public UpdateBotServer = async (req: RequestWithBot, res: Response, next: NextFunction): Promise<void> => {
    try {
      const UpdateBotServerData = await this.botService.UpdateBotServer(req);
      res.status(200).json({ status: 200, data: UpdateBotServerData, message: '성공적으로 서버수를 업데이트 했습니다.' });
    } catch (error) {
      next(error);
    }
  }

  public ReportBot = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.botService.ReportBot(req);
      res.status(200).json({ status: 200, message: '성공적으로 신고가 접수되었습니다. 처리까지 최대 3일까지 걸릴 수 있습니다' });
    } catch (error) {
      next(error);
    }
  }

  public RefreshBotToken = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const RefreshBotTokenData = await this.botService.refreshBotToken(req);
      res.status(200).json({ status: 200, data: RefreshBotTokenData, message: '성공적으로 봇 토큰을 재발급 했습니다' });
    } catch (error) {
      next(error);
    }
  }

  public UpdateBotData = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const UpdateBotBotData = await this.botService.UpdateBot(req);
      res.status(200).json({ status: 200, data: UpdateBotBotData, message: '성공적으로 봇 정보를 업데이트 했습니다' });
    } catch (error) {
      next(error);
    }
  }

  public getBotComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // @ts-ignore
      if(!req.query.page) req.query.page = 1;
      // @ts-ignore
      let cacheData = cache.get(`botcomments_${req.params.id}_${Number(req.query.page)}`);
      if(cacheData) {
        res.status(200).json({ status: 200, data: cacheData, message: '요청을 성공적으로 실행했습니다.' });
      } else {
        const findServerCommentsData: FindBotCommentsDataList = await this.botService.findBotComments(req.params.id, Number(req.query.page));
        res.status(200).json({ status: 200, data: findServerCommentsData, message: '요청을 성공적으로 실행했습니다.' });
        cache.set(`botcomments_${req.params.id}_${Number(req.query.page)}`, findServerCommentsData);
      }
    } catch (error) {
      next(error);
    }
  }

  public postBotComment = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      let commentData = await this.botService.addBotComments(req);
      res.status(200).json({ status: 200, message: '댓글를 추가했습니다!', data: commentData });
    } catch (error) {
      next(error);
    }
  }

  public deleteBotComment = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      let commentData = await this.botService.deleteBotComments(req);
      res.status(200).json({ status: 200, message: '댓글을 삭제했습니다!', data: commentData });
    } catch (error) {
      next(error);
    }
  }

  public getBotByOwner = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findOneServerData: FindbotData = await this.botService.findBotByOwner(req);
      res.status(200).json({ status: 200, data: findOneServerData, message: '요청을 성공적으로 실행했습니다.' });
    } catch (error) {
      next(error);
    }
  }
}

export default botsController;
