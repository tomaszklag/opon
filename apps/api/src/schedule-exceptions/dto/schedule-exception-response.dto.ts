import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ScheduleExceptionResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty({ example: '2026-12-25' }) date!: string;
  @ApiProperty({ example: 'Boże Narodzenie' }) reason!: string;
  @ApiProperty() isClosed!: boolean;
  @ApiPropertyOptional({ type: String, nullable: true, example: '10:00' }) customOpenTime!:
    | string
    | null;
  @ApiPropertyOptional({ type: String, nullable: true, example: '14:00' }) customCloseTime!:
    | string
    | null;
}
