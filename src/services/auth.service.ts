import { sign } from 'jsonwebtoken';
import { CLIENT_ID, CLIENT_SECRET, COOKIE_DOMAIN, REDIRECT_URL, SECRET_KEY } from '@config';
import { DataStoredInToken, TokenData } from '@interfaces/auth.interface';
import axios from 'axios';
import userModel from '@/models/users.model';
import { User } from '@/interfaces/users.interface';
import { HttpException } from '@/exceptions/HttpException';
import { URLSearchParams } from 'url';

class AuthService {
  public createToken(user: User): TokenData {
    const dataStoredInToken: DataStoredInToken = { id: user.id, discordAccessToken: user.discordAccessToken };
    const secretKey: string = SECRET_KEY;
    const expiresIn: number = 604800;

    return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
  }
  public async login(code: string): Promise<string> {
    const formData = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code.toString(),
      redirect_uri: REDIRECT_URL,
  });
    const token = await axios.post('https://discord.com/api/oauth2/token', formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }).catch(error => {
      console.log(error.response.data);
      throw new HttpException(401, '유저 인증에 실패했습니다')
    })
    const user = await axios.get(`https://discord.com/api/users/@me`,{
      headers: {
        'Authorization': `Bearer ${token.data.access_token}`
      }
    })
    const findUser: User = await userModel.findOne({id: user.data.id});
    if(!findUser) {
      const newUser = await userModel.findOneAndUpdate({id: user.data.id}, {$set: {
        discordAccessToken: token.data.access_token,
        discordRefreshToken: token.data.refresh_token,
        email: user.data.email,
        archive_flags: 0,
        published_date: new Date(),
        id: user.data.id,
        username: user.data.username,
        discriminator: user.data.discriminator,
        avatar: user.data.avatar
      }}, {upsert: true, new: true});
      return this.createCookie(this.createToken(newUser));
    } else {
      const updateUser = await userModel.findOneAndUpdate({id: user.data.id}, {
        discordAccessToken: token.data.access_token,
        discordRefreshToken: token.data.refresh_token,
        email: user.data.email
      }, {new: true});
      return this.createCookie(this.createToken(updateUser));
    }
  }
  public createCookie(tokenData: TokenData): string {
    return `Authorization=${tokenData.token}; Max-Age=${tokenData.expiresIn}; domain=${COOKIE_DOMAIN}; path=/`;
  }
}

export default AuthService;
