import { HttpException } from '@exceptions/HttpException';
import { ArchiveDiscordUser, User } from '@interfaces/users.interface';
import { CAPTCHA_SECRET, ORIGIN, SECRET_KEY, TOKEN } from '@/config';
import { verify } from 'jsonwebtoken';
import { verify as CaptchaVerify} from "hcaptcha"
import { DataStoredInToken, RequestWithUser } from '@/interfaces/auth.interface';
import { client, getUser, LogSend } from '@/utils/discord';
import { DiscordUserGuild, FindServerCommentsDataList, FindServerData, FindServerDataList, Server, ServerComments, ServerCommentsData } from '@/interfaces/servers.interface';
import userModel from '@/models/users.model';
import serverModel from '@/models/servers.model';
import serverSubmitModel from '@/models/serversSubmit.model';
import serverCommentModel from '@/models/serverComments.model';
import serverLikeModel from '@/models/serverLike.model';
import nodeCache from '@/utils/Cache';
import axios, { AxiosError } from "axios";
import { SearchResult, SearchResultReturn } from '@/interfaces/search.interface';
import botModel from '@/models/bots.model';

class SearchService {
  public async SearchByQuery(query: string, page: number): Promise<SearchResultReturn> {
    const botsResult: SearchResult[] = [];
    const serversResult: SearchResult[] = [];
    const servers = await serverModel.find({$or: [{name: {$regex: query, $options: 'i'}}, {description: {$regex: query, $options: 'i'}}, {sortDescription: {$regex: query, $options: 'i'}}, {categories: {$regex: query, $options: 'i'}}]}).sort({likes: -1})
    const bots = await botModel.find({$or: [{name: {$regex: query, $options: 'i'}}, {description: {$regex: query, $options: 'i'}}, {sortDescription: {$regex: query, $options: 'i'}}, {categories: {$regex: query, $options: 'i'}}]}).sort({likes: -1})
    servers.slice(12 * (page - 1), 12 + 12 * (page - 1)).forEach(server => {
      let serverCache = client.guilds.cache.get(server.id)
      serversResult.push({
        id: server.id,
        type: 'server',
        sortDescription: server.sortDescription,
        like: server.like,
        name: (serverCache ? serverCache.name : server.name),
        icon: (serverCache ? serverCache.icon : server.icon),
        members: (serverCache ? serverCache.memberCount : server.members),
        update: (serverCache ? true : false)
      })
    })
    bots.slice(12 * (page - 1), 12 + 12 * (page - 1)).forEach(bot => {
      let userCache = client.users.cache.get(bot.id)
      botsResult.push({
        id: bot.id,
        type: 'bot',
        sortDescription: bot.sortDescription,
        like: bot.like,
        name: (userCache ? userCache.username : bot.name),
        icon: (userCache ? userCache.avatar : bot.icon),
        servers: bot.servers,
        update: (userCache ? true : false),
        discriminator: (userCache ? userCache.discriminator : bot.discriminator),
        invite: bot.invite
      })
    })
    return {
      totalPage: bots.length > servers.length ? bots.length : servers.length,
      bots: botsResult,
      servers: serversResult
    };
  }
}

export default SearchService;
