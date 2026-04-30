import { ApiProperty } from '@nestjs/swagger';

export class WorkerTaskResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() providerId!: string;
  @ApiProperty({ nullable: true }) workerId!: string | null;
  @ApiProperty({ nullable: true }) workerName!: string | null;
  @ApiProperty() title!: string;
  @ApiProperty() startAt!: string;
  @ApiProperty() endAt!: string;
  @ApiProperty({ nullable: true }) notes!: string | null;
  @ApiProperty() createdAt!: string;
}
