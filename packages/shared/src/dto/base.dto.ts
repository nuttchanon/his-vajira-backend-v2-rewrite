import { IsOptional, IsString, IsDate } from 'class-validator';
import { Transform } from 'class-transformer';

export class BaseDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  createdAt?: Date;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => new Date(value))
  updatedAt?: Date;

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}
