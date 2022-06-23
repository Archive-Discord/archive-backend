import { IsArray, IsOptional, IsString } from 'class-validator';

export class SubmitServerDto {
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
}

export class ServerDenyDto {
  @IsString()
  public reason: string;
}

export class ServerReportDto {
  @IsString()
  public reason: string;
  @IsString()
  public report_type: reportType;
}

type reportType =  "guide_line" | "personal_information" | "advertising" | "illegal_information" | "discord_tos" | "other"; 