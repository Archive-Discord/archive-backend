import { hash } from 'bcrypt';
import { CreateUserDto } from '@dtos/users.dto';
import { HttpException } from '@exceptions/HttpException';
import { FindeUserDiscordUser, User } from '@interfaces/users.interface';
import userModel from '@/models/users.model';
import { isEmpty } from '@utils/util';
import { Request } from 'express';
import { SECRET_KEY } from '@/config';
import { verify } from 'jsonwebtoken';
import { DataStoredInToken } from '@/interfaces/auth.interface';
import { client } from '@/utils/discord';

class UserService {
  public async findUserById(userId: string): Promise<User> {
    const findUser: User = await userModel.findOne({id: userId}, {$select: ['id', 'archive_flags', 'published_date']});
    if (!findUser) throw new HttpException(404, "찾을 수 없는 유저입니다");

    return findUser;
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
        new HttpException(401, '로그인 후 이용해주세요');
      }
    } else {
      new HttpException(401, '로그인 후 이용해주세요');
    }
  }
}

export default UserService;
