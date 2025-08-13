import { IsOptional, IsNumber, Min, Max, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class PaginationQueryDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  pageSize?: number = 10;

  @IsOptional()
  @IsString()
  sort?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  filter?: string;
}

export class PaginationResponseDto<T> {
  data: T[] = [];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } = {
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  };
}

export class PaginationMeta {
  page: number = 1;
  pageSize: number = 10;
  total: number = 0;
  totalPages: number = 0;
  hasNext: boolean = false;
  hasPrev: boolean = false;
}
