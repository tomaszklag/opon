import { Global, Module } from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service';
import { EmailService } from './email.service';

@Global()
@Module({
  providers: [EmailService, EmailVerificationService],
  exports: [EmailService, EmailVerificationService],
})
export class EmailModule {}
