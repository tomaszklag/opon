import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @ApiPropertyOptional() @IsBoolean() @IsOptional() newBookingSms?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() newBookingEmail?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() newBookingPush?: boolean;

  @ApiPropertyOptional() @IsBoolean() @IsOptional() cancelationSms?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() cancelationEmail?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() cancelationPush?: boolean;

  @ApiPropertyOptional() @IsBoolean() @IsOptional() reminder30Sms?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() reminder30Email?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() reminder30Push?: boolean;

  @ApiPropertyOptional() @IsBoolean() @IsOptional() newReviewSms?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() newReviewEmail?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() newReviewPush?: boolean;

  @ApiPropertyOptional() @IsBoolean() @IsOptional() weeklyReportSms?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() weeklyReportEmail?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() weeklyReportPush?: boolean;

  @ApiPropertyOptional() @IsBoolean() @IsOptional() platformNewsSms?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() platformNewsEmail?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() platformNewsPush?: boolean;
}
