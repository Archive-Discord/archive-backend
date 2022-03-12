import { IsArray, IsOptional, IsString } from 'class-validator';

export class SubmitBotDto {
  @IsString()
  public id: string;
  @IsString()
  public description: string;
  @IsString()
  public sortDescription: string;
  @IsArray()
  public categoios: string[];
  @IsOptional()
  @IsString()
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
