import { NextFunction, Request, Response } from 'express';
import cache from "@utils/Cache";
import { FindServerCommentsDataList, FindServerData, FindServerDataList } from '@interfaces/servers.interface';
import serverService from '@services/servers.service';
import { RequestWithUser } from '@/interfaces/auth.interface';

class ServersController {
  public serverService = new serverService();

  public getServerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cacheData = cache.get(`server_${req.params.id}`);
      if(cacheData) {
        res.status(200).json({ status: 200, data: cacheData, message: '요청을 성공적으로 실행했습니다.' });
      } else {
        const findOneServerData: FindServerData = await this.serverService.findServerById(req.params.id);
        res.status(200).json({ status: 200 ,data: findOneServerData, message: '요청을 성공적으로 실행했습니다.' });
        cache.set(`server_${req.params.id}`, findOneServerData, 1800);
      }
    } catch (error) {
      next(error);
    }
  };

  public getServerByOwner = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findOneServerData: FindServerData = await this.serverService.findServerByOwner(req);

      res.status(200).json({ status: 200, data: findOneServerData, message: '요청을 성공적으로 실행했습니다.' });
    } catch (error) {
      next(error);
    }
  }

  public getServerComments = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if(!req.query.page) req.query.page = 1;
      const cacheData = cache.get(`servercomments_${req.params.id}_${Number(req.query.page)}`);
      if(cacheData) {
        res.status(200).json({ status: 200, data: cacheData, message: '요청을 성공적으로 실행했습니다.' });
      } else {
        const findServerCommentsData: FindServerCommentsDataList = await this.serverService.findServerComments(req.params.id, Number(req.query.page));
        res.status(200).json({ status: 200, data: findServerCommentsData, message: '요청을 성공적으로 실행했습니다.' });
        cache.set(`servercomments_${req.params.id}_${Number(req.query.page)}`, findServerCommentsData);
      }
    } catch (error) {
      next(error);
    }
  }

  public postServerComments = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const commentData = await this.serverService.addServerComments(req);
      res.status(200).json({ status: 200, message: '댓글를 추가했습니다!', data: commentData });
    } catch (error) {
      next(error);
    }
  }

  public deleteServerComments = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.serverService.deleteServerComments(req);
      res.status(200).json({ status: 200, message: '댓글을 삭제했습니다!' });
    } catch (error) {
      next(error);
    }
  }

  public inviteServer = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.serverService.JoinServer(req);
      res.status(200).json({ status: 200, message: '성공적으로 서버에 입장되었습니다!' });
    } catch (error) {
      next(error);
    }
  }

  public likeServer = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.serverService.likeServer(req);
      res.status(200).json({ status: 200, message: '서버에 좋아요를 추가했습니다!' });
    } catch (error) {
      next(error);
    }
  }

  public getServers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if(!req.query.page) req.query.page = 1;
      const cacheData = cache.get(`servers_${Number(req.query.page)}`);
      if(cacheData) {
        res.status(200).json({ status: 200, data: cacheData, message: '요청을 성공적으로 실행했습니다.' });
      } else {
        const findOneServerData: FindServerDataList = await this.serverService.findServers(Number(req.query.page));
        res.status(200).json({ data: findOneServerData, message: '요청을 성공적으로 실행했습니다.' });
        cache.set(`servers_${Number(req.query.page)}`, findOneServerData);
      }
    } catch (error) {
      next(error);
    }
  }

  public getServersMe = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const findServersMe = await this.serverService.findServersMe(req);
      res.status(200).json({ data: findServersMe, message: '요청을 성공적으로 실행했습니다.' });
    } catch (error) {
      next(error);
    }
  }
  public addServer = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const addServerData = await this.serverService.addServers(req);
      res.status(200).json({ data: addServerData, message: '신청을 성공적으로 완료했습니다!' });
    } catch (error) {
      next(error);
    }
  }

  public reportServer = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reportServerData = await this.serverService.reportServer(req);
      res.status(200).json({ data: reportServerData, message: '신고를 성공적으로 완료했습니다!' });
    } catch (error) {
      next(error);
    }
  }
}

export default ServersController;
