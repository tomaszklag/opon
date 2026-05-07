import { Global, Module } from '@nestjs/common';
import { EmailChangeService } from './email-change.service';
import { EmailVerificationService } from './email-verification.service';
import { EmailService } from './email.service';

@Global()
@Module({
  providers: [EmailService, EmailVerificationService, EmailChangeService],
  exports: [EmailService, EmailVerificationService, EmailChangeService],
})
export class EmailModule {}
