import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CreateReplyDto {
  @ApiProperty({ maxLength: 500 })
  @IsString()
  @Length(1, 500)
  text!: string;
}
