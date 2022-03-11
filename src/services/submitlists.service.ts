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

class SubmitlistsService {
  public async findSubmitList(): Promise<submitList[]> {
    const findSubmitList: Server[] = await serverSubmitModel.find().sort({published_date: -1})
    const submitList: submitList[] = [];
    findSubmitList.forEach((server) => {
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
      if (!findServer) throw new HttpException(404, "찾을 수 없는 서버입니다");
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
        flags: findServer.flags
      }
      return serverData;
  }

  public async AcceptSubmitServer(serverId: string, auth: User): Promise<boolean> {
    const findServer: Server = await serverSubmitModel.findOne({id: serverId})
    if (!findServer) throw new HttpException(404, "이미 처리가 완료되었거나, 찾을 수 없는 서버입니다");
    const server = client.guilds.cache.get(findServer.id)
    if (!server) throw new HttpException(400, "봇이 입장 되어있지 않습니다");
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
    await serverSubmitModel.deleteOne({id: serverId})
    LogSend('ACCEPT_SERVER', auth, `
    > 서버: ${server.name}
    > 서버 아이디: ${server.id}
    `, findServer.owners, server)
    await acceptServer.save().catch(err => {if(err) throw new HttpException(500, '데이터 저장중 오류가 발생했습니다.')});
    return true;
  }

  public async DenySubmitServer(serverId: string, auth: User, reason: string): Promise<boolean> {
    const findServer: Server = await serverSubmitModel.findOne({id: serverId})
    if (!findServer) throw new HttpException(404, "이미 처리가 완료되었거나, 찾을 수 없는 서버입니다");
    const server = client.guilds.cache.get(findServer.id)
    if (!server) throw new HttpException(400, "봇이 입장 되어있지 않습니다");
    await serverSubmitModel.deleteOne({id: serverId})
    LogSend('DENY_SERVER', auth, `
    > 서버: ${server.name}
    > 서버 아이디: ${server.id}
    > 거절 사유: ${reason}
    `, findServer.owners, server, reason)
    return true;
  }
}

export default SubmitlistsService;
