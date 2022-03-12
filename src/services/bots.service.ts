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
import { DiscordAPIError } from 'discord.js';
import { Bot } from '@/interfaces/bots.interface';
import botModel from '@/models/bots.model';
import botSubmitModel from '@/models/botsSubmit.model';

class BotService {
  public async findSubmitBotById(botId: string): Promise<User> {
    const discordBot = await client.users.fetch(botId)
    .catch((e: DiscordAPIError) => {
      if(e.httpStatus === 404) {
        throw new HttpException(404, "찾을 수 없는 봇 입니다");
      }
    })
    if(!discordBot) throw new HttpException(404, "찾을 수 없는 봇 입니다");
    if(!discordBot.bot) throw new HttpException(400, "봇만 추가하실 수 있습니다");
    return discordBot;
  }

  public async addBot(req: RequestWithUser): Promise<Bot> {
    const discordBot = await client.users.fetch(req.body.id)
    .catch((e: DiscordAPIError) => {
      if(e.httpStatus === 404) {
        throw new HttpException(404, "찾을 수 없는 봇 입니다");
      }
    })
    if(!discordBot) throw new HttpException(404, "찾을 수 없는 봇 입니다");
    if(!discordBot.bot) throw new HttpException(400, "봇만 신청하실 수 있습니다");
    let botLive = await botModel.findOne({id: req.body.id})
    if(botLive) throw new HttpException(409, "이미 존재하는 봇 입니다");
    let serverSubmit = await botSubmitModel.findOne({id: req.body.id})
    if(serverSubmit) throw new HttpException(409, "이미 신청한 봇 입니다");
    const bot = new botSubmitModel()
    bot.id = req.body.id;
    bot.name = discordBot.username;
    bot.icon = discordBot.avatar;
    bot.discriminator = discordBot.discriminator;
    bot.description = req.body.description;
    bot.sortDescription = req.body.sortDescription;
    bot.website = req.body.website;
    bot.support = req.body.support;
    bot.like = 0;
    bot.servers = 0;
    bot.published_date = new Date();  
    bot.owners = [req.user.id];
    bot.categories = req.body.categoios;
    let data: Bot = await bot.save().catch(err => {if(err) throw new HttpException(500, '데이터 저장중 오류가 발생했습니다.')}) as Bot;
    LogSend('SUBMIT_BOT', req.user, `
    > 봇: ${discordBot.username} (\`${discordBot.id}\`)
    > 설명: ${req.body.sortDescription}

    > [확인하기](${ORIGIN}/pendinglist)
    `, [req.user.id], null, null, discordBot);
    return data;
  }
}

export default BotService;
