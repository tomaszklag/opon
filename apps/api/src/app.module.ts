import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { HealthModule } from './health/health.module';
import { PrismaModule } from './prisma/prisma.module';
import { PricingTiersModule } from './pricing-tiers/pricing-tiers.module';
import { ProvidersModule } from './providers/providers.module';
import { WorkingHoursModule } from './working-hours/working-hours.module';
import { GusModule } from './gus/gus.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    AuthModule,
    ProvidersModule,
    PricingTiersModule,
    WorkingHoursModule,
    GusModule,
  ],
  providers: [
    // Globalny guard — wszystkie endpointy wymagają JWT, chyba że @Public()
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
