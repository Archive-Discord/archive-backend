import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { SECRET_KEY } from '@config';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken, RequestWithUser } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import userModel from '@/models/users.model';
import { checkUserFlag } from '@/utils/util';
import ratelimit from "express-rate-limit";


const baseLimiter = ratelimit({
  windowMs: 60 * 1000 * 10, // 레이트 리밋 몇분 초기화 할건지
  max: 500, // 레이트 리밋 최대 횟수
  statusCode: 429, // 레이트 리밋 상태코드
  keyGenerator: (req) => req.headers['x-forwarded-for'] as string,
  handler: (req: Request, res: Response) => {
    res.status(429).json({ status: 429, message: "요청이 너무 많습니다 잠시 후 다시 시도해주세요" });
  }
})

const BotServerUpdateLimiter = ratelimit({
  windowMs: 60 * 1000 * 1, // 레이트 리밋 몇분 초기화 할건지
  max: 3, // 레이트 리밋 최대 횟수
  statusCode: 429, // 레이트 리밋 상태코드
  keyGenerator: (req) => req.headers['Authorization'] as string,
  handler: (req: Request, res: Response) => {
    res.status(429).json({ status: 429, message: "요청이 너무 많습니다 잠시 후 다시 시도해주세요" });
  }
})

export { baseLimiter, BotServerUpdateLimiter };
