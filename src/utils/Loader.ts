import { HttpException } from "@/exceptions/HttpException";
import { Bot, FindbotData, FindBotDataList } from "@/interfaces/bots.interface"
import { FindServerData, Server } from "@/interfaces/servers.interface";
import { User } from "@/interfaces/users.interface"
import botModel from "@/models/bots.model";
import { client, getUser } from "./discord";
import serverModel from '@/models/servers.model';

export const findBotById = async(id: string): Promise<FindbotData|undefined> => {
    const findBot: Bot = await botModel.findOne({ id: id });
    if(!findBot) throw new HttpException(404, '찾을 수 없는 봇입니다');
    const bot = client.users.cache.get(findBot.id);
    const owners: User[] = [];
    for await (const owner of findBot.owners) {
        const user = await getUser(owner);
        owners.push(user);
    }
    if (bot) {
        await botModel.updateOne(
          { id: bot.id },
          { $set: { name: bot.username, discriminator: bot.discriminator, icon: bot.avatar, created_at: bot.createdAt } },
        );
    }
    return {
        id: findBot.id,
        description: findBot.description,
        icon: bot ? bot.avatar : findBot.icon,
        sortDescription: findBot.sortDescription,
        like: findBot.like,
        categories: findBot.categories,
        published_date: findBot.published_date,
        created_at: bot ? bot.createdAt : findBot.created_at,
        owners: owners,
        name: bot ? bot.username : findBot.name,
        new: bot ? true : false,
        servers: findBot.servers,
        flags: findBot.flags,
        discriminator: bot ? bot.discriminator : findBot.discriminator,
        website: findBot.website,
        support: findBot.support,
        invite: findBot.invite,
        prefix: findBot.prefix
    }
}

export const findBotByIdOwner = async(id: string, user: User): Promise<FindbotData|undefined> => {
    const findBot: Bot = await botModel.findOne({ id: id });
    if (!findBot) throw new HttpException(404, '찾을 수 없는 봇입니다');
    if (!findBot.owners.includes(user.id)) throw new HttpException(403, '해당 봇을 관리할 권한이 없습니다');
    const bot = client.users.cache.get(findBot.id);
    const owners: User[] = [];
    for await (const owner of findBot.owners) {
      const user = await getUser(owner);
      owners.push(user);
    }
    if (bot) {
      await botModel.updateOne(
        { id: bot.id },
        { $set: { name: bot.username, discriminator: bot.discriminator, icon: bot.avatar, created_at: bot.createdAt } },
      );
    }
    return {
        id: findBot.id,
        description: findBot.description,
        icon: bot ? bot.avatar : findBot.icon,
        sortDescription: findBot.sortDescription,
        like: findBot.like,
        categories: findBot.categories,
        published_date: findBot.published_date,
        created_at: bot ? bot.createdAt : findBot.created_at,
        owners: owners,
        name: bot ? bot.username : findBot.name,
        new: bot ? true : false,
        servers: findBot.servers,
        flags: findBot.flags,
        discriminator: bot ? bot.discriminator : findBot.discriminator,
        website: findBot.website,
        support: findBot.support,
        invite: findBot.invite,
        token: findBot.token,
        prefix: findBot.prefix,
    }
}

export const findServerById = async(serverId: string): Promise<FindServerData> => {
    const findServer: Server = await serverModel.findOne({ id: serverId });
    if (!findServer) throw new HttpException(404, '찾을 수 없는 서버입니다');
    const server = client.guilds.cache.get(findServer.id);
    const owners: User[] = [];
    for await (const owner of findServer.owners) {
      const user = await getUser(owner);
      owners.push(user);
    }
    if (server) {
      await serverModel.updateOne(
        { id: findServer.id },
        { $set: { name: server.name, members: server.memberCount, icon: server.icon, created_at: server.createdAt } },
      );
    }
    return {
        id: findServer.id,
        description: findServer.description,
        icon: server ? server.icon : findServer.icon,
        sortDescription: findServer.sortDescription,
        like: findServer.like,
        categories: findServer.categories,
        published_date: findServer.published_date,
        create_date: server ? server.createdAt : findServer.created_at,
        owners: owners,
        name: server ? server.name : findServer.name,
        bot: server ? true : false,
        members: server ? server.memberCount : findServer.members,
        flags: findServer.flags,
        website: findServer.website,
        support: findServer.support,
    }
}