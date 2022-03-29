import { HttpException } from '@exceptions/HttpException';
import { User } from '@interfaces/users.interface';
import { CAPTCHA_SECRET, ORIGIN, SECRET_KEY, TOKEN } from '@/config';
import { sign } from 'jsonwebtoken';
import { verify as CaptchaVerify} from "hcaptcha"
import { DataStoredInToken, RequestWithBot, RequestWithBotUserAuth, RequestWithUser } from '@/interfaces/auth.interface';
import { client, fetchUser, getUser, LogSend } from '@/utils/discord';
import { DiscordUserGuild, FindServerCommentsDataList, FindServerData, FindServerDataList, Server, ServerComments, ServerCommentsData } from '@/interfaces/servers.interface';
import userModel from '@/models/users.model';
import serverModel from '@/models/servers.model';
import serverSubmitModel from '@/models/serversSubmit.model';
import serverCommentModel from '@/models/serverComments.model';
import serverLikeModel from '@/models/serverLike.model';
import nodeCache from '@/utils/Cache';
import axios, { AxiosError } from "axios";
import { DiscordAPIError } from 'discord.js';
import { Bot, FindBotDataList, FindbotData, FindBotCommentsDataList, botComments, botCommentsData, botUserLike } from '@/interfaces/bots.interface';
import botModel from '@/models/bots.model';
import botSubmitModel from '@/models/botsSubmit.model';
import botLikeModel from '@/models/botLike.model';
import botCommentModel from '@/models/botComments.model';
import botReportModel from '@/models/reportbots.model';

class BotService {

  public async findBotById(botId: string): Promise<FindbotData> {
    const findBot: Bot = await botModel.findOne({id: botId})
    if (!findBot) throw new HttpException(404, "찾을 수 없는 봇입니다");
    const bot = client.users.cache.get(findBot.id)
    const owners: User[] = [];
    for await (const owner of findBot.owners) {
      let user = await getUser(owner)
      owners.push(user);
    }
    if(bot) {
      await botModel.updateOne({id: bot.id}, {$set: {name: bot.username, discriminator: bot.discriminator, icon: bot.avatar, created_at: bot.createdAt}})
    }
    let findBotData: FindbotData = {
      id: findBot.id,
      description: findBot.description,
      icon: (bot ? bot.avatar : findBot.icon),
      sortDescription: findBot.sortDescription,
      like: findBot.like,
      categories: findBot.categories,
      published_date: findBot.published_date,
      created_at: (bot ? bot.createdAt : findBot.created_at),
      owners: owners,
      name: (bot ? bot.username : findBot.name),
      new: bot ? true : false,
      servers: findBot.servers,
      flags: findBot.flags,
      discriminator: (bot ? bot.discriminator : findBot.discriminator),
      website: findBot.website,
      support: findBot.support,
      invite: findBot.invite,
      prefix: findBot.prefix
    }
    return findBotData;
  }

  public async findbots(page: number): Promise<FindBotDataList> {
    const findBots: Bot[] = await botModel.find({}, {}).sort({like: -1}).limit(12).skip(12 * (page - 1));
    const totalPage = await botModel.countDocuments();
    const bots: FindbotData[] = [];
    for await (const botresults of findBots) {
      const bot = client.users.cache.get(botresults.id)
      if(bot) {
        await botModel.updateOne({id: botresults.id}, {$set: {name: bot.username, discriminator: bot.discriminator, icon: bot.avatar, created_at: bot.createdAt}})
      }
      let botData: FindbotData = {
        id: botresults.id,
        sortDescription: botresults.sortDescription,
        icon: (bot ? bot.avatar : botresults.icon),
        like: botresults.like,
        name: (bot ? bot.username : botresults.name),
        new: (bot ? true : false),
        servers: botresults.servers,
        flags: botresults.flags,
        discriminator: (bot ? bot.discriminator : botresults.discriminator),
        created_at: (bot ? bot.createdAt : botresults.created_at),
        invite: botresults.invite,
      }
      bots.push(botData);
    }
    return {
      totalPage: totalPage,
      bot: bots
    }
  }
  public async findSubmitBotById(botId: string): Promise<User> {
    const discordBot = await fetchUser(botId)
    if(!discordBot) throw new HttpException(404, "찾을 수 없는 봇 입니다");
    if(!discordBot.bot) throw new HttpException(400, "봇만 추가하실 수 있습니다");
    return discordBot;
  }

  public async addBot(req: RequestWithUser): Promise<Bot> {
    const discordBot = await fetchUser(req.body.id)
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
    bot.invite = req.body.invite;
    bot.prefix = req.body.prefix;
    let data: Bot = await bot.save().catch(err => {if(err) throw new HttpException(500, '데이터 저장중 오류가 발생했습니다.')}) as Bot;
    LogSend('SUBMIT_BOT', req.user, `
    > 봇: ${discordBot.username} (\`${discordBot.id}\`)
    > 설명: ${req.body.sortDescription}

    > [확인하기](${ORIGIN}/pendinglist)
    > [초대하기](${req.body.invite})
    `, [req.user.id], null, null, discordBot);
    return data;
  }

  public async likeBot(req: RequestWithUser): Promise<boolean> {
    const captcha = await CaptchaVerify(CAPTCHA_SECRET, req.body.captcha_token)
    if(captcha.success === true) {
      const findBot: Bot = await botModel.findOne({id: req.params.id})
      if (!findBot) throw new HttpException(404, "등록되어 있지 않은 봇 입니다");
      const bot = client.users.cache.get(findBot.id)
      if(!bot) throw new HttpException(404, "봇 정보를 찾을 수 없습니다");
      const like = await botLikeModel.findOne({bot_id: req.params.id, user_id: req.user.id})
      let today = new Date();
      if(!like) {
        await botModel.updateOne({id: req.params.id}, {$inc: {like: 1}})
        await botLikeModel.updateOne({bot_id: req.params.id, user_id: req.user.id}, {$set: {last_like: today}}, {upsert: true})
        nodeCache.del(`bot_${req.params.id}`)
      } else {
        let lastDate = new Date(like.last_like);
        if((Number(today) - Number(lastDate)) / (60*60*1000) > 24) {
          await botModel.updateOne({id: req.params.id}, {$inc: {like: 1}})
          await botLikeModel.updateOne({bot_id: req.params.id, user_id: req.user.id}, {$set: {last_like: today}}, {upsert: true})
          nodeCache.del(`bot_${req.params.id}`)
        } else {
          throw new HttpException(404, "하루에 한번 좋아요를 누를 수 있습니다");
        }
      }
    } else {
      throw new HttpException(403, "캡챠 인증에 실패했습니다");
    }
    return true
  }

  public async likeBotUserCheck(req: RequestWithBot): Promise<botUserLike> {
    const UserLike = await botLikeModel.findOne({bot_id: req.params.id, user_id: req.params.user_id});
    if(!UserLike) throw new HttpException(404, "유저를 찾을 수 없습니다");
    if((Number(new Date()) - Number(UserLike.last_like)) / (60*60*1000) > 24) {
      return {
        like: false,
        resetLike: 0,
        lastLike: Number(UserLike.last_like)
      };
    }
    const resetDate = new Date()
    resetDate.setDate(resetDate.getDate() + 1)
    return {
      like: true,
      resetLike: Number(resetDate) - Number(UserLike.last_like),
      lastLike: Number(UserLike.last_like)
    };
  }

  public async findBotComments(botId: string, page: number): Promise<FindBotCommentsDataList> {
    const findServerComments: botComments[] = await botCommentModel.find({bot_id: botId}, {}).sort({published_date: -1}).limit(10).skip(10 * (page - 1));
    const totalPage = await botCommentModel.countDocuments({bot_id: botId});
    const botComments: botCommentsData[] = [];
    for await (const serverComment of findServerComments) {
      
      const user: User = await getUser(serverComment.user_id)
      const serverCommentData: botCommentsData = {
        id: serverComment._id,
        user_id: serverComment.user_id,
        user: user,
        comment: serverComment.comment,
        published_date: serverComment.published_date,
        bot_id: serverComment.bot_id
      }
      botComments.push(serverCommentData);
    }
    return {
      totalPage: totalPage,
      comments: botComments
    }
  }

  public async addBotComments(req: RequestWithUser): Promise<botComments> {
    const comment = new botCommentModel()
    comment.user_id = req.user.id;
    comment.bot_id = req.params.id;
    comment.comment = req.body.comment; 
    comment.published_date = new Date();
    LogSend('ADD_COMMENT', req.user, `
    > 봇 ${req.params.id}
    > 댓글 ${req.body.comment}
    `)
    let data: botComments = await comment.save().catch(err => {if(err) throw new HttpException(500, '데이터 저장중 오류가 발생했습니다.')}) as botComments;
    nodeCache.del(`botcomments_${req.params.id}_1`);
    return data;
  }

  public async deleteBotComments(req: RequestWithUser): Promise<boolean> {
    let comment = await botCommentModel.findOne({bot_id: req.params.id, _id: req.body.id})
    if(!comment) throw new HttpException(404, "찾을 수 없는 댓글입니다");
    if(comment.user_id !== req.user.id) throw new HttpException(403, "본인의 댓글만 삭제할 수 있습니다");
    nodeCache.del(`botcomments_${req.params.id}_1`);
    await botCommentModel.deleteOne({_id: req.body.id})
    return true;
  }

  public async UpdateBotServer(req: RequestWithBot): Promise<boolean> {
    await botModel.updateOne({id: req.bot.id}, {$set: {servers: req.body.servers}})
    return true
  }

  public async refreshBotToken(req: RequestWithUser): Promise<string> {
    const bot = await botModel.findOne({id: req.params.id})
    if(!bot) throw new HttpException(404, "등록되어 있지 않은 봇 입니다");
    if(!bot.owners.includes(req.user.id)) throw new HttpException(403, "해당 봇을 관리할 권한이 없습니다");
    const dataStoredInToken = { id: bot.id };
    const token = sign(dataStoredInToken, SECRET_KEY, { expiresIn: 604800 })
    await botModel.updateOne({id: bot.id}, {$set: {token: token}})
    return token
  }

  public async UpdateBot(req: RequestWithUser): Promise<boolean> {
    const bot = await botModel.findOne({id: req.params.id})
    if(!bot) throw new HttpException(404, "등록되어 있지 않은 봇 입니다");
    if(!bot.owners.includes(req.user.id)) throw new HttpException(403, "해당 봇을 관리할 권한이 없습니다");
    await botModel.updateOne({id: bot.id}, {$set: {categories: req.body.categoios, description: req.body.description, name: req.body.name, sortDescription: req.body.sortDescription, website: req.body.website, support: req.body.support, invite: req.body.invite, prefix: req.body.prefix}})
    nodeCache.del(`bot_${req.params.id}`);
    return true
  }

  public async ReportBot(req: RequestWithUser): Promise<boolean> {
    const bot = await botModel.findOne({id: req.params.id})
    if(!bot) throw new HttpException(404, "등록되어 있지 않은 봇 입니다");
    const botReport = new botReportModel()
    botReport.user_id = req.user.id;
    botReport.bot_id = req.params.id;
    botReport.resson = req.body.reason;
    botReport.report_type = req.body.report_type;
    botReport.save().catch(err => {if(err) throw new HttpException(500, '데이터 저장중 오류가 발생했습니다.')})
    LogSend('ADD_COMMENT', req.user, `
    > 봇 ${req.params.id}
    > 댓글 ${req.body.comment}
    `)
    return true
  }


  public async findBotByOwner(req: RequestWithUser): Promise<FindbotData> {
    const findBot: Bot = await botModel.findOne({id: req.params.id})
    if (!findBot) throw new HttpException(404, "찾을 수 없는 봇입니다");
    if(!findBot.owners.includes(req.user.id)) throw new HttpException(403, "해당 봇을 관리할 권한이 없습니다");
    const bot = client.users.cache.get(findBot.id)
    const owners: User[] = [];
    for await (const owner of findBot.owners) {
      let user = await getUser(owner)
      owners.push(user);
    }
    if(bot) {
      await botModel.updateOne({id: bot.id}, {$set: {name: bot.username, discriminator: bot.discriminator, icon: bot.avatar, created_at: bot.createdAt}})
    }
    let findBotData: FindbotData = {
      id: findBot.id,
      description: findBot.description,
      icon: (bot ? bot.avatar : findBot.icon),
      sortDescription: findBot.sortDescription,
      like: findBot.like,
      categories: findBot.categories,
      published_date: findBot.published_date,
      created_at: (bot ? bot.createdAt : findBot.created_at),
      owners: owners,
      name: (bot ? bot.username : findBot.name),
      new: bot ? true : false,
      servers: findBot.servers,
      flags: findBot.flags,
      discriminator: (bot ? bot.discriminator : findBot.discriminator),
      website: findBot.website,
      support: findBot.support,
      invite: findBot.invite,
      token: findBot.token,
      prefix: findBot.prefix
    }
    return findBotData;
  }
}

export default BotService;
