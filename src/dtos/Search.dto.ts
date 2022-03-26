import { IsOptional, IsString } from 'class-validator';
export class SeachQueryDto {
  @IsString()
  public query: string;

  @IsOptional()
  @IsString()
  public page: string;
}