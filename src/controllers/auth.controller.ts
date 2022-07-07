import { NextFunction, Request, Response } from 'express';
import { RequestWithUser } from '@interfaces/auth.interface';
import AuthService from '@services/auth.service';
import { CLIENT_ID, REDIRECT_URL, COOKIE_DOMAIN, ORIGIN } from '@/config';

class AuthController {
  public authService = new AuthService();

  public logIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const code = req.query.code;
      if(!code) return res.redirect('/auth/discord');
      const cookie = await this.authService.login(code as string);

      res.setHeader('Set-Cookie', [cookie]);
      res.redirect(`${ORIGIN.split(' ')[0]}/redirect`);
    } catch (error) {
      next(error);
    }
  };

  public logInUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URL}&response_type=code&scope=identify email guilds guilds.join&prompt=none`);
    } catch (error) {
      next(error);
    }
  };

  public logOut = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      res.setHeader('Set-Cookie', [`Authorization=; Max-age=0; domain=${COOKIE_DOMAIN}; path=/`]);
      res.redirect(`${ORIGIN}`);
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
