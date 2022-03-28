import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { SECRET_KEY } from '@config';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, RequestWithUser, RequestWithBot } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import userModel from '@/models/users.model';
import { checkUserFlag } from '@/utils/util';
import botModel from '@/models/bots.model';
import { Bot } from '@/interfaces/bots.interface';

const authMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const Authorization = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);

    if (Authorization) {
      const secretKey: string = SECRET_KEY;
      const verificationResponse = (await verify(Authorization, secretKey)) as DataStoredInToken;
      const userId = verificationResponse.id;
      const findUser: User = await userModel.findOne({id: userId});

      if (findUser) {
        req.user = findUser;
        next();
      } else {
        next(new HttpException(401, '유저 인증에 실패했습니다'));
      }
    } else {
      next(new HttpException(401, '유저 인증에 실패했습니다'));
    }
  } catch (error) {
    next(new HttpException(401, '유저 인증에 실패했습니다'));
  }
};

const authReviewerMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const Authorization = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);

    if (Authorization) {
      const secretKey: string = SECRET_KEY;
      const verificationResponse = (await verify(Authorization, secretKey)) as DataStoredInToken;
      const userId = verificationResponse.id;
      const findUser: User = await userModel.findOne({id: userId});
      if (findUser) {
        if(checkUserFlag(findUser.archive_flags, 'reviewer')) {
          req.user = findUser;
          next();
        } else {
          next(new HttpException(401, '리뷰어 권한이 없습니다'));
        }
      } else {
        next(new HttpException(401, '유저 인증에 실패했습니다'));
      }
    } else {
      next(new HttpException(401, '유저 인증에 실패했습니다'));
    }
  } catch (error) {
    next(new HttpException(401, '유저 인증에 실패했습니다'));
  }
};

const authBotMiddleware = async (req: RequestWithBot, res: Response, next: NextFunction) => {
  try {
    const Authorization = (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);
    if (Authorization) {
      const findBot: Bot = await botModel.findOne({token: Authorization});
      if (findBot) {
        req.bot = findBot;
        next();
      } else {
        next(new HttpException(401, '봇 인증에 실패했습니다'));
      }
    } else {
      next(new HttpException(401, '봇 인증에 실패했습니다'));
    }
  } catch (error) {
    next(new HttpException(401, '봇 인증에 실패했습니다'));
  }
};


export default authMiddleware;
export { authReviewerMiddleware, authBotMiddleware };
