import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { RolesGuard } from './auth/guards/roles.guard';
import { HealthModule } from './health/health.module';
import { PhotosModule } from './photos/photos.module';
import { PrismaModule } from './prisma/prisma.module';
import { PricingTiersModule } from './pricing-tiers/pricing-tiers.module';
import { ProvidersModule } from './providers/providers.module';
import { WorkingHoursModule } from './working-hours/working-hours.module';
import { EmailModule } from './email/email.module';
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
    EmailModule,
    AuthModule,
    ProvidersModule,
    PricingTiersModule,
    WorkingHoursModule,
    GusModule,
    PhotosModule,
    AdminModule,
  ],
  providers: [
    // Globalny guard — wszystkie endpointy wymagają JWT, chyba że @Public()
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Globalny guard — sprawdza @Roles() dekorator
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
