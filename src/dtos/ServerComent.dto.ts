import { IsString } from 'class-validator';

export class ServerComentDto {
  @IsString()
  public comment: string;
}

export class ServerComentDeleteDto {
  @IsString()
  public id: string;
}

export class ServerVerifyDto {
  @IsString()
  public captcha_token: string;
}
