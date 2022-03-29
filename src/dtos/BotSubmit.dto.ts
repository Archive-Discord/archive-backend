import { IsArray, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';

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

  @IsString()
  public prefix: string;
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

export class BotServerCountDto {
  @IsNumber()
  public servers: string;
}

export class BotTokenUpdateDto {
  @IsString()
  public token: string;
}

export class BotReportDto {
  @IsString()
  public reason: string;
  @IsString()
  public report_type: reportType;
}

type reportType =  "guide_line" | "personal_information" | "advertising" | "illegal_information" | "discord_tos" | "other"; 
