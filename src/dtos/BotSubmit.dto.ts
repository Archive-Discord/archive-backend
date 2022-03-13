import { IsArray, IsOptional, IsString, IsUrl } from 'class-validator';

export class SubmitBotDto {
  @IsString()
  public id: string;

  @IsString()
  public description: string;

  @IsString()
  public sortDescription: string;

  @IsArray()
  public categoios: string[];

  @IsString()
  @IsUrl()
  public invite: string;

  @IsOptional()
  @IsString()
  @IsUrl()
  public website?: string;

  @IsOptional()
  @IsString()
  public support?: string;
}

export class BotDenyDto {
  @IsString()
  public reason: string;
}

export class BotFindDto {
  @IsString()
  public id: string;
}

export class BotComentDto {
  @IsString()
  public comment: string;
}

export class BotComentDeleteDto {
  @IsString()
  public id: string;
}

export class BotVerifyDto {
  @IsString()
  public captcha_token: string;
}

