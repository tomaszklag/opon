import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { HealthModule } from './health/health.module';
import { PhotosModule } from './photos/photos.module';
import { PrismaModule } from './prisma/prisma.module';
import { PricingTiersModule } from './pricing-tiers/pricing-tiers.module';
import { ProvidersModule } from './providers/providers.module';
import { WorkingHoursModule } from './working-hours/working-hours.module';
import { GusModule } from './gus/gus.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
      serveStaticOptions: { index: false },
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    ProvidersModule,
    PricingTiersModule,
    WorkingHoursModule,
    GusModule,
    PhotosModule,
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
