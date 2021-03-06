import { HttpException } from '@exceptions/HttpException';
import { ArchiveDiscordUser, User } from '@interfaces/users.interface';
import { ORIGIN, SECRET_KEY } from '@/config';
import { verify } from 'jsonwebtoken';
import { DataStoredInToken, RequestWithUser } from '@/interfaces/auth.interface';
import { client, getUser, LogSend } from '@/utils/discord';
import { DiscordUserGuild, FindServerCommentsDataList, FindServerData, FindServerDataList, Server, ServerComments, ServerCommentsData } from '@/interfaces/servers.interface';
import userModel from '@/models/users.model';
import serverModel from '@/models/servers.model';
import serverSubmitModel from '@/models/serversSubmit.model';
import { submitList } from '@/interfaces/submitList.interface'
import nodeCache from '@/utils/Cache';
import axios from "axios";
import { Bot, FindbotData } from '@/interfaces/bots.interface';
import botSubmitModel from '@/models/botsSubmit.model';
import botModel from '@/models/bots.model';

class SubmitlistsService {
  public async findSubmitList(): Promise<submitList[]> {
    const findServerSubmitList: Server[] = await serverSubmitModel.find().sort({published_date: -1})
    const findBotSubmitList: Bot[] = await botSubmitModel.find().sort({published_date: -1})
    const submitList: submitList[] = [];

    findBotSubmitList.forEach(bot => {
      let discordUser = client.users.cache.get(bot.id)
      let botData: submitList = {
        id: bot.id,
        name: (discordUser ? discordUser.username : bot.name),
        description: bot.sortDescription,
        icon: (discordUser ? discordUser.avatar : bot.icon),
        type: 'bot',
        update: (discordUser ? true : false),
        published_date: bot.published_date,
        discriminator: (discordUser ? discordUser.discriminator : bot.discriminator),
      }
      submitList.push(botData);
    })
    findServerSubmitList.forEach((server) => {
      let discordServer = client.guilds.cache.get(server.id)
      let serverData: submitList = {
        id: server.id,
        name: (discordServer ? discordServer.name : server.name),
        description: server.sortDescription,
        icon: (discordServer ? discordServer.icon : server.icon),
        type: 'server',
        update: (discordServer ? true : false),
        published_date: server.published_date,
      }
      submitList.push(serverData);
    })
    return submitList;
  }

  public async findSubmitServer(serverId: string): Promise<FindServerData> {
    const findServer: Server = await serverSubmitModel.findOne({id: serverId})
      if (!findServer) throw new HttpException(404, "?????? ??? ?????? ???????????????");
      const server = client.guilds.cache.get(findServer.id)
      const owners: User[] = [];
      for await (const owner of findServer.owners) {
        let user = await getUser(owner)
        owners.push(user);
      }
      let serverData: FindServerData = {
        id: findServer.id,
        description: findServer.description,
        icon: (server ? server.icon : findServer.icon),
        sortDescription: findServer.sortDescription,
        like: findServer.like,
        categories: findServer.categories,
        published_date: findServer.published_date,
        create_date: (server ? server.createdAt : findServer.created_at),
        owners: owners,
        name: (server ? server.name : findServer.name),
        bot: server ? true : false,
        members: (server ? server.memberCount : findServer.members),
        flags: findServer.flags,
        website: findServer.website,
        support: findServer.support,
      }
      return serverData;
  }

  public async AcceptSubmitServer(serverId: string, auth: User): Promise<boolean> {
    const findServer: Server = await serverSubmitModel.findOne({id: serverId})
    if (!findServer) throw new HttpException(404, "?????? ????????? ??????????????????, ?????? ??? ?????? ???????????????");
    const server = client.guilds.cache.get(findServer.id)
    if (!server) throw new HttpException(400, "?????? ?????? ???????????? ????????????");
    const acceptServer = new serverModel()
    acceptServer.id = findServer.id;
    acceptServer.name = server.name;
    acceptServer.description = findServer.description;
    acceptServer.sortDescription = findServer.sortDescription;
    acceptServer.icon = server.icon;
    acceptServer.members = server.memberCount;
    acceptServer.owners = findServer.owners;
    acceptServer.categories = findServer.categories;
    acceptServer.published_date = findServer.published_date;
    acceptServer.like = 0;
    acceptServer.website = findServer.website;
    acceptServer.support = findServer.support;
    await serverSubmitModel.deleteOne({id: serverId})
    LogSend('ACCEPT_SERVER', auth, `
    > ??????: ${server.name}
    > ?????? ?????????: ${server.id}
    `, findServer.owners, findServer)
    await acceptServer.save().catch(err => {if(err) throw new HttpException(500, '????????? ????????? ????????? ??????????????????.')});
    return true;
  }

  public async DenySubmitServer(serverId: string, auth: User, reason: string): Promise<boolean> {
    const findServer: Server = await serverSubmitModel.findOne({id: serverId})
    if (!findServer) throw new HttpException(404, "?????? ????????? ??????????????????, ?????? ??? ?????? ???????????????");
    await serverSubmitModel.deleteOne({id: serverId})
    LogSend('DENY_SERVER', auth, `
    > ??????: ${findServer.name}
    > ?????? ?????????: ${findServer.id}
    > ?????? ??????: ${reason}
    `, findServer.owners, findServer, reason)
    return true;
  }

  public async findSubmitBot(botId: string): Promise<FindbotData> {
    const findBot: Bot = await botSubmitModel.findOne({id: botId})
    if (!findBot) throw new HttpException(404, "?????? ??? ?????? ????????????");
    const bot = client.users.cache.get(findBot.id)
    const owners: User[] = [];
    for await (const owner of findBot.owners) {
      let user = await getUser(owner)
      owners.push(user);
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
      new: (bot ? true : false),
      servers: findBot.servers,
      flags: findBot.flags,
      discriminator: (bot ? bot.discriminator : findBot.discriminator),
      website: findBot.website,
      support: findBot.support,
      prefix: findBot.prefix
    }
    return findBotData;
  }

  public async AcceptSubmitBot(botId: string, auth: User): Promise<boolean> {
    const findBot: Bot = await botSubmitModel.findOne({id: botId})
    if (!findBot) throw new HttpException(404, "?????? ????????? ??????????????????, ?????? ??? ?????? ????????????");
    const bot = client.users.cache.get(findBot.id)
    if (!bot) throw new HttpException(400, "?????? ??????????????? ?????? ???????????? ????????????");
    const acceptBot = new botModel()
    acceptBot.id = bot.id;
    acceptBot.name = bot.username;
    acceptBot.description = findBot.description;
    acceptBot.sortDescription = findBot.sortDescription;
    acceptBot.icon = bot.avatar;
    acceptBot.servers = findBot.servers;
    acceptBot.owners = findBot.owners;
    acceptBot.categories = findBot.categories;
    acceptBot.published_date = findBot.published_date;
    acceptBot.like = findBot.like;
    acceptBot.invite = findBot.invite;
    acceptBot.prefix = findBot.prefix;
    acceptBot.support = findBot.support;
    await botSubmitModel.deleteOne({id: botId})
    LogSend('ACCEPT_BOT', auth, `
    > ???: ${bot.username}
    > ??? ?????????: ${bot.id}
    `, findBot.owners, null, null, bot)
    await acceptBot.save().catch(err => {if(err) throw new HttpException(500, '????????? ????????? ????????? ??????????????????.')});
    return true;
  }

  public async DenySubmitBot(botId: string, auth: User, reason: string): Promise<boolean> {
    const findBot: Bot = await botSubmitModel.findOne({id: botId})
    if (!findBot) throw new HttpException(404, "?????? ????????? ??????????????????, ?????? ??? ?????? ??? ?????????");
    const bot = client.users.cache.get(findBot.id)
    if (!bot) throw new HttpException(400, "?????? ??????????????? ?????? ???????????? ????????????");
    await botSubmitModel.deleteOne({id: botId})
    LogSend('DENY_BOT', auth, `
    > ???: ${bot.username}
    > ??? ?????????: ${bot.id}
    > ?????? ??????: ${reason}
    `, findBot.owners, null, reason, bot)
    return true;
  }
}

export default SubmitlistsService;
