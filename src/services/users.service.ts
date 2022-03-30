import { hash } from 'bcrypt';
import { CreateUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { FindeUserDiscordUser, User } from '@interfaces/users.interface';
import userModel from '@/models/users.model';
import serverModel from '@/models/servers.model';
import { Request } from 'express';
import { SECRET_KEY } from '@/config';
import { verify } from 'jsonwebtoken';
import { DataStoredInToken } from '@/interfaces/auth.interface';
import { client } from '@/utils/discord';
import { Server } from '@/interfaces/servers.interface';
import { Bot } from '@/interfaces/bots.interface';
import botModel from '@/models/bots.model';

class UserService {
  public async findUserById(userId: string): Promise<User> {
    const findUser: User = await userModel.findOne({id: userId}, {id: 1, archive_flags: 1, published_date: 1, _id: 0, name: 1, discriminator: 1, avatar: 1, username: 1});
    if (!findUser) throw new HttpException(404, "찾을 수 없는 유저입니다");
    const servers: Server[] = await serverModel.find({owners: { $in : [userId] }}, {_id: 0, icon: 1, name: 1, sortDescription: 1, like: 1, members: 1, id: 1, created_at: 1, flags: 1});
    const bots: Bot[] = await botModel.find({owners: { $in : [userId] }}, {_id: 0, icon: 1, name: 1, sortDescription: 1, like: 1, servers: 1, id: 1, created_at: 1, flags: 1, discriminator: 1});
    let discordUser = client.users.cache.get(userId);
    let userData: User = {
      id: findUser.id,
      archive_flags: findUser.archive_flags,
      published_date: findUser.published_date,
      username: (discordUser ? discordUser.username : findUser.username),
      discriminator: (discordUser ? discordUser.discriminator : findUser.discriminator),
      avatar: (discordUser ? discordUser.avatar : findUser.avatar),
      servers: servers,
      bots: bots,
      new: (discordUser ? true : false)
    }

    return userData;
  }

  public async findUserByMe(req: Request): Promise<FindeUserDiscordUser> {
    const Authorization = req.cookies['Authorization'] || (req.header('Authorization') ? req.header('Authorization').split('Bearer ')[1] : null);

    if (Authorization) {
      const secretKey: string = SECRET_KEY;
      const verificationResponse = verify(Authorization, secretKey) as DataStoredInToken;
      const userId = verificationResponse.id;
      const findUser: User = await userModel.findOne({id: userId});

      if (findUser) {
        return {
          id: findUser.id,
          email: findUser.email,
          archive_flags: findUser.archive_flags,
          discordAccessToken: findUser.discordAccessToken,
          discordRefreshToken: findUser.discordRefreshToken,
          published_date: findUser.published_date,
          user: client.users.cache.get(userId)
        }
      } else {
        throw new HttpException(401, '로그인 후 이용해주세요');
      }
    } else {
      throw new HttpException(401, '로그인 후 이용해주세요');
    }
  }
}

export default UserService;
