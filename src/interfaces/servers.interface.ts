import { User } from "./users.interface";

export interface Server {
  id: string;
  description?: string;
  icon:string;
  name: string;
  members: number;
  sortDescription: string;
  website?: string;
  support?:string;
  like: number;
  owners: string[];
  categories: string[];
  token?: string;
  flags: number;
  published_date: Date;
  created_at: Date;
}
export interface ServerComments {
  _id: string;
  server_id: string;
  user_id: string;
  comment: string;
  published_date: Date;
}

export interface ServerLike {
  server_id: string,
  user_id: string,
  last_like: Date
}

export interface ServerCommentsData {
  id: string;
  server_id: string;
  user_id: string;
  comment: string;
  published_date: Date;
  user: User;
}

export interface FindServerData {
  id: string;
  name: string;
  icon: string;
  members: number;
  bot: boolean;
  flags: number;
  description?: string;
  sortDescription: string;
  like: number;
  owners?: User[];
  comments?: ServerComments[];
  categories?: string[];
  token?: string;
  published_date?: Date;
  create_date?: Date;
  website?: string;
  support?: string;
}

export interface FindServerDataList {
  server: FindServerData[];
  totalPage: number;
}


export interface FindServerCommentsDataList {
  comments: ServerCommentsData[];
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