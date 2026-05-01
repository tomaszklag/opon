import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProviderType } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';

export class ListProvidersQueryDto {
  @ApiPropertyOptional({ enum: ProviderType })
  @IsOptional()
  @IsEnum(ProviderType)
  type?: ProviderType;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit: number = 20;
}
