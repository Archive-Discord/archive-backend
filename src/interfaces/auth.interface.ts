import { Request } from 'express';
import { User } from '@interfaces/users.interface';
import { Bot } from './bots.interface';

export interface DataStoredInToken {
  id: string;
  discordAccessToken: string;
}

export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface RequestWithUser extends Request {
  user: User;
}

export interface RequestWithBot extends Request {
  bot: Bot;
}

export interface RequestWithBotUserAuth extends RequestWithBot {
  user: User;
}
