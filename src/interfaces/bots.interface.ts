import { User } from "./users.interface";

export interface Bot {
  id: string;
  description?: string;
  icon:string;
  name: string;
  sortDescription: string;
  website?: string;
  like: number;
  owners: string[];
  categories: string[];
  token?: string;
  flags: number;
  published_date: Date;
  created_at: Date;
  support?: string
  discriminator: string
  servers: number
  new: boolean
  invite: string
  prefix: string
}
export interface botComments {
  _id: string;
  bot_id: string;
  user_id: string;
  comment: string;
  published_date: Date;
}

export interface ServerLike {
  server_id: string,
  user_id: string,
  last_like: Date
}

export interface botCommentsData {
  id: string;
  bot_id: string;
  user_id: string;
  comment: string;
  published_date: Date;
  user: User;
}

export interface FindbotData {
  id: string;
  name: string;
  icon: string;
  flags: number;
  description?: string;
  sortDescription: string;
  like: number;
  owners?: User[];
  comments?: botComments[];
  categories?: string[];
  token?: string;
  published_date?: Date;
  create_date?: Date;
  website?: string;
  created_at: Date;
  support?: string
  discriminator: string
  servers: number,
  new?: boolean
  invite?: string
  prefix?: string
}

export interface FindBotDataList {
  bot: FindbotData[];
  totalPage: number;
}


export interface FindBotCommentsDataList {
  comments: botCommentsData[];
  totalPage: number;
}

export interface DiscordUserGuild {
  id: string;
  name: string;
  icon: string;
  owner: boolean;
  permissions: number;
  permissions_new: number;
  bot: boolean;
  features: string[];
}

export interface botLike {
  bot_id: string,
  user_id: string,
  last_like: Date
}

export interface botUserLike {
  like: boolean
  resetLike: number
  lastLike: number
}

export interface BotReport {
  resson: string
  user_id: string
  bot_id: string
  report_type: string 
}