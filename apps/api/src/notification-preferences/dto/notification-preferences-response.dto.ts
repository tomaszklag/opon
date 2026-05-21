import { ApiProperty } from '@nestjs/swagger';

export class NotificationPreferencesDto {
  @ApiProperty() newBookingSms!: boolean;
  @ApiProperty() newBookingEmail!: boolean;
  @ApiProperty() newBookingPush!: boolean;

  @ApiProperty() cancelationSms!: boolean;
  @ApiProperty() cancelationEmail!: boolean;
  @ApiProperty() cancelationPush!: boolean;

  @ApiProperty() reminder30Sms!: boolean;
  @ApiProperty() reminder30Email!: boolean;
  @ApiProperty() reminder30Push!: boolean;

  @ApiProperty() newReviewSms!: boolean;
  @ApiProperty() newReviewEmail!: boolean;
  @ApiProperty() newReviewPush!: boolean;

  @ApiProperty() weeklyReportSms!: boolean;
  @ApiProperty() weeklyReportEmail!: boolean;
  @ApiProperty() weeklyReportPush!: boolean;

  @ApiProperty() platformNewsSms!: boolean;
  @ApiProperty() platformNewsEmail!: boolean;
  @ApiProperty() platformNewsPush!: boolean;
}
