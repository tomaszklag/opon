import { ApiProperty } from '@nestjs/swagger';
import { ServiceType } from '@prisma/client';
import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsArray, IsEnum, IsInt, Max, Min, ValidateNested } from 'class-validator';

export class ServiceConfigItemDto {
  @ApiProperty({ enum: ServiceType }) @IsEnum(ServiceType) serviceType!: ServiceType;
  @ApiProperty({ minimum: 5, maximum: 240 }) @IsInt() @Min(5) @Max(240) durationMinutes!: number;
}

export class UpsertServiceConfigsDto {
  @ApiProperty({ type: [ServiceConfigItemDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ServiceConfigItemDto)
  configs!: ServiceConfigItemDto[];
}
