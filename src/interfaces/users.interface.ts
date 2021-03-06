import { User as DiscordUser, Presence } from "discord.js";
import { Bot } from "./bots.interface";
import { Server } from "./servers.interface";

export interface User {
  id: string;
  email?: string;
  username: String,
  discriminator: String,
  avatar: String,
  archive_flags?: number;
  discordAccessToken?: string;
  discordRefreshToken?: string;
  token?: string;
  refreshToken?: string;
  published_date?: Date;
  new?: boolean;
  servers?: Server[];
  bots?: Bot[];
  presence? : Presence;
}

export interface FindeUserDiscordUser {
  id: string;
  email: string;
  archive_flags: number;
  discordAccessToken: string;
  discordRefreshToken: string;
  token?: string;
  refreshToken?: string;
  published_date: Date;
  user: DiscordUser
}

export interface ArchiveDiscordUser {
  id: string;
  bot: boolean;
  system: boolean;
  flags: number;
  username: string;
  discriminator: string;
  avatar: string;
  banner: string;
  accentColor: string;
}

export enum ArchvieUserFlags {
	general = 0 << 0,
	manager = 1 << 0,
	bughunter = 1 << 1,
	reviewer = 1 << 2,
	premium = 1 << 3
}
