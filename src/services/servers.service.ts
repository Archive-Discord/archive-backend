import { HttpException } from '@exceptions/HttpException';
import { ArchiveDiscordUser, User } from '@interfaces/users.interface';
import { CAPTCHA_SECRET, ORIGIN, SECRET_KEY, TOKEN } from '@/config';
import { verify } from 'jsonwebtoken';
import { verify as CaptchaVerify } from 'hcaptcha';
import { DataStoredInToken, RequestWithUser } from '@/interfaces/auth.interface';
import { client, getUser, LogSend } from '@/utils/discord';
import {
  DiscordUserGuild,
  FindServerCommentsDataList,
  FindServerData,
  FindServerDataList,
  Server,
  ServerComments,
  ServerCommentsData,
  ServerUserLike,
} from '@/interfaces/servers.interface';
import userModel from '@/models/users.model';
import serverModel from '@/models/servers.model';
import serverSubmitModel from '@/models/serversSubmit.model';
import serverCommentModel from '@/models/serverComments.model';
import serverLikeModel from '@/models/serverLike.model';
import nodeCache from '@/utils/Cache';
import axios, { AxiosError } from 'axios';
import { Request } from 'express';
import { findServerById as findServer, findServerById} from '@/utils/Loader';
import botReportModel from '@/models/reportbots.model';
import { Bot } from '@/interfaces/bots.interface';

class ServerService {
  public async findServerById(serverId: string): Promise<FindServerData> {
    return await findServer(serverId)
  }

  public async findServerComments(serverId: string, page: number): Promise<FindServerCommentsDataList> {
    const findServerComments: ServerComments[] = await serverCommentModel
      .find({ server_id: serverId }, {})
      .sort({ published_date: -1 })
      .limit(10)
      .skip(10 * (page - 1));
    const totalPage = await serverCommentModel.countDocuments({ server_id: serverId });
    const serverComments: ServerCommentsData[] = [];
    for await (const serverComment of findServerComments) {
      const user: User = await getUser(serverComment.user_id);
      const serverCommentData: ServerCommentsData = {
        id: serverComment._id,
        user_id: serverComment.user_id,
        user: user,
        comment: serverComment.comment,
        published_date: serverComment.published_date,
        server_id: serverComment.server_id,
      };
      serverComments.push(serverCommentData);
    }
    return {
      totalPage: totalPage,
      comments: serverComments,
    };
  }

  public async addServerComments(req: RequestWithUser): Promise<ServerComments> {
    const comment = new serverCommentModel();
    comment.user_id = req.user.id;
    comment.server_id = req.params.id;
    comment.comment = req.body.comment;
    comment.published_date = new Date();
    LogSend(
      'ADD_COMMENT',
      req.user,
      `
    > ?????? ${req.params.id}
    > ?????? ${req.body.comment}
    `,
    );
    const data: ServerComments = (await comment.save().catch(err => {
      if (err) throw new HttpException(500, '????????? ????????? ????????? ??????????????????.');
    })) as ServerComments;
    nodeCache.del(`servercomments_${req.params.id}_1`);
    return data;
  }

  public async deleteServerComments(req: RequestWithUser): Promise<boolean> {
    const comment = await serverCommentModel.findOne({ server_id: req.params.id, _id: req.body.id });
    if (!comment) throw new HttpException(404, '?????? ??? ?????? ???????????????');
    if (comment.user_id !== req.user.id) throw new HttpException(403, '????????? ????????? ????????? ??? ????????????');
    nodeCache.del(`servercomments_${req.params.id}_1`);
    await serverCommentModel.deleteOne({ _id: req.body.id });
    return true;
  }

  public async findServerByOwner(req: RequestWithUser): Promise<FindServerData> {
    const Authorization = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);

    if (Authorization) {
      const secretKey: string = SECRET_KEY;
      const verificationResponse = verify(Authorization, secretKey) as DataStoredInToken;
      const userId = verificationResponse.id;
      const findUser: User = await userModel.findOne({ id: userId });
      const findServer: Server = await serverModel.findOne({ id: req.params.id });
      if (!findServer) throw new HttpException(404, '?????? ??? ?????? ???????????????');
      if (!findServer.owners.includes(findUser.id)) throw new HttpException(403, '????????? ????????? ????????? ????????????');
      const server = client.guilds.cache.get(findServer.id);
      const owners: ArchiveDiscordUser[] = [];
      findServer.owners.forEach(owner => {
        owners.push(client.users.cache.get(owner).toJSON() as ArchiveDiscordUser);
      });
      const serverData: FindServerData = {
        id: findServer.id,
        icon: server ? server.icon : findServer.icon,
        description: findServer.description,
        sortDescription: findServer.sortDescription,
        like: findServer.like,
        published_date: findServer.published_date,
        owners: owners,
        name: server ? server.name : findServer.name,
        bot: server ? true : false,
        members: server ? server.memberCount : findServer.members,
        flags: findServer.flags,
        token: findServer.token,
      };
      return serverData;
    } else {
      new HttpException(401, '????????? ??? ??????????????????');
    }
  }

  public async findServers(page: number): Promise<FindServerDataList> {
    const findServers: Server[] = await serverModel
      .find({}, {})
      .sort({ like: -1 })
      .limit(12)
      .skip(12 * (page - 1));
    const totalPage = await serverModel.countDocuments();
    const servers: FindServerData[] = [];
    for await (const serverresults of findServers) {
      const server = client.guilds.cache.get(serverresults.id);
      if (server) {
        await serverModel.updateOne({ id: serverresults.id }, { $set: { name: server.name, members: server.memberCount, icon: server.icon } });
      }
      const serverData: FindServerData = {
        id: serverresults.id,
        sortDescription: serverresults.sortDescription,
        icon: server ? server.icon : serverresults.icon,
        like: serverresults.like,
        name: server ? serverresults.name : serverresults.name,
        bot: server ? true : false,
        members: server ? server.memberCount : serverresults.members,
        flags: serverresults.flags,
      };
      servers.push(serverData);
    }
    return {
      totalPage: totalPage,
      server: servers,
    };
  }

  public async findServersMe(req: RequestWithUser): Promise<DiscordUserGuild[]> {
    const guilds = await axios.get(`https://discord.com/api/users/@me/guilds`, {
      headers: {
        Authorization: 'Bearer ' + req.user.discordAccessToken,
      },
    });
    if (guilds.status !== 200) throw new HttpException(500, '?????? ????????? ??????????????? ??????????????????.');
    const data: DiscordUserGuild[] = guilds.data;
    const guildsReturn: DiscordUserGuild[] = [];
    for await (const guild of data) {
      if (guild.permissions == 2147483647) {
        delete guild.features;
        const liveServer = await serverModel.findOne({ id: guild.id });
        const SubmitServer = await serverSubmitModel.findOne({ id: guild.id });
        const guildCache = client.guilds.cache.get(guild.id);
        if (!guildCache) {
          guild.bot = false;
        } else {
          guild.bot = true;
        }
        if (!liveServer && !SubmitServer) guildsReturn.push(guild);
      }
    }
    return guildsReturn;
  }

  public async addServers(req: RequestWithUser): Promise<Server> {
    const discordServer = client.guilds.cache.get(req.body.id);
    if (!discordServer) throw new HttpException(404, '?????? ???????????? ?????? ?????? ???????????????');
    const serverLive = await serverModel.findOne({ id: req.body.id });
    if (serverLive) throw new HttpException(409, '?????? ???????????? ???????????????');
    const serverSubmit = await serverSubmitModel.findOne({ id: req.body.id });
    if (serverSubmit) throw new HttpException(409, '?????? ????????? ???????????????');
    const server = new serverSubmitModel();
    server.id = req.body.id;
    server.name = discordServer.name;
    server.icon = discordServer.icon;
    server.description = req.body.description;
    server.sortDescription = req.body.sortDescription;
    server.website = req.body.website;
    server.like = 0;
    server.published_date = new Date();
    server.owners = [req.user.id];
    server.categories = req.body.categoios;
    const data: Server = (await server.save().catch(err => {
      if (err) throw new HttpException(500, '????????? ????????? ????????? ??????????????????.');
    })) as Server;
    LogSend(
      'SUBMIT_SERVER',
      req.user,
      `
    > ??????: ${discordServer.name} (\`${discordServer.id}\`)
    > ??????: ${req.body.sortDescription}

    > [????????????](${ORIGIN.split(' ')[0]}/pendinglist)
    `,
      [req.user.id],
      discordServer as unknown as Server,
    );
    return data;
  }

  public async JoinServer(req: RequestWithUser): Promise<boolean> {
    const captcha = await CaptchaVerify(CAPTCHA_SECRET, req.body.captcha_token);
    if (captcha.success === true) {
      const findServer: Server = await serverModel.findOne({ id: req.params.id });
      if (!findServer) throw new HttpException(404, '?????? ??? ?????? ???????????????');
      const server = client.guilds.cache.get(findServer.id);
      if (!server) throw new HttpException(404, '????????? ?????? ???????????? ?????? ????????????');
      await axios
        .put(
          `https://discord.com/api/guilds/${req.params.id}/members/${req.user.id}`,
          JSON.stringify({ access_token: req.user.discordAccessToken }),
          {
            headers: {
              Authorization: 'Bot ' + TOKEN,
              'Content-Type': 'application/json',
            },
          },
        )
        .catch((e: AxiosError) => {
          if (e.response.data.code == 10001) throw new HttpException(404, `??? ??? ?????? ???????????????`);
          else if (e.response.data.code == 10004) throw new HttpException(404, `?????? ??? ?????? ??????????????? ??????????????? ?????? ????????????`);
          else if (e.response.data.code == 10007) throw new HttpException(404, `??? ??? ?????? ???????????????`);
          else if (e.response.data.code == 10009) throw new HttpException(403, `????????? ????????????`);
          else if (e.response.data.code == 30001) throw new HttpException(403, `????????? ??? ?????? ????????? ??????????????????`);
          else if (e.response.data.code == 40001) throw new HttpException(403, `????????? ????????????. ???????????? ??? ??????????????????`);
          else if (e.response.data.code == 40007) throw new HttpException(403, `?????? ???????????? ?????? ???????????????`);
          else if (e.response.status == 403 || 401) throw new HttpException(403, `????????? ????????????. ???????????? ??? ??????????????????`);
          else throw new HttpException(500, `${e.response.data.code} ??? ??? ?????? ????????? ?????????????????? ??? ????????? ?????? ??????????????? ????????? ?????????`);
        });
    } else {
      throw new HttpException(403, '?????? ????????? ??????????????????');
    }
    return true;
  }

  public async likeServer(req: RequestWithUser): Promise<boolean> {
    const captcha = await CaptchaVerify(CAPTCHA_SECRET, req.body.captcha_token);
    if (captcha.success === true) {
      const findServer: Server = await serverModel.findOne({ id: req.params.id });
      if (!findServer) throw new HttpException(404, '???????????? ?????? ?????? ???????????????');
      const server = client.guilds.cache.get(findServer.id);
      if (!server) throw new HttpException(404, '????????? ?????? ???????????? ?????? ????????????');
      const like = await serverLikeModel.findOne({ server_id: req.params.id, user_id: req.user.id });
      const today = new Date();
      if (!like) {
        await serverModel.updateOne({ id: req.params.id }, { $inc: { like: 1 } });
        await serverLikeModel.updateOne({ server_id: req.params.id, user_id: req.user.id }, { $set: { last_like: today } }, { upsert: true });
      } else {
        const lastDate = new Date(like.last_like);
        if ((Number(today) - Number(lastDate)) / (60 * 60 * 1000) > 24) {
          await serverModel.updateOne({ id: req.params.id }, { $inc: { like: 1 } });
          await serverLikeModel.updateOne({ server_id: req.params.id, user_id: req.user.id }, { $set: { last_like: today } }, { upsert: true });
        } else {
          throw new HttpException(404, '????????? ?????? ???????????? ?????? ??? ????????????');
        }
      }
    } else {
      throw new HttpException(403, '?????? ????????? ??????????????????');
    }
    return true;
  }

  public async likeBotUserCheck(req: Request): Promise<ServerUserLike> {
    const UserLike = await serverLikeModel.findOne({ server_id: req.params.id, user_id: req.params.user_id });
    if (!UserLike) throw new HttpException(404, '????????? ?????? ??? ????????????');
    if ((Number(new Date()) - Number(UserLike.last_like)) / (60 * 60 * 1000) > 24) {
      return {
        like: false,
        resetLike: 0,
        lastLike: Number(UserLike.last_like),
      };
    }
    return {
      like: true,
      resetLike: Number(new Date()) - Number(UserLike.last_like),
      lastLike: Number(UserLike.last_like),
    };
  }

  public async reportServer(req: RequestWithUser): Promise<boolean> {
    const findServerData = await findServerById(req.params.id)
    const botReport = new botReportModel();
    botReport.user_id = req.user.id;
    botReport.bot_id = req.params.id;
    botReport.reason = req.body.reason;
    botReport.report_type = req.body.report_type;
    botReport.save().catch(err => {
      if (err) throw new HttpException(500, '????????? ????????? ????????? ??????????????????.');
    });
    LogSend(
      'REPORT_SERVER',
      req.user,
      `
    > ?????? ${findServerData.name} (\`${req.params.id}\`)
    > ?????? ${req.body.reason}
    > ?????? ?????? ${req.body.report_type}
    `,
      null,
      null,
      req.body.reason,
      null,
      findServerData as unknown as Bot,
    );
    return true;
  }
}

export default ServerService;
