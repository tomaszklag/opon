import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
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
import { EmailModule } from './email/email.module';
import { GusModule } from './gus/gus.module';
import { BookingsModule } from './bookings/bookings.module';
import { ReviewsModule } from './reviews/reviews.module';
import { StationsModule } from './stations/stations.module';
import { WorkersModule } from './workers/workers.module';
import { WorkerTasksModule } from './worker-tasks/worker-tasks.module';
import { RealtimeModule } from './realtime/realtime.module';
import { ServiceConfigsModule } from './service-configs/service-configs.module';
import { ServicesModule } from './services/services.module';
import { NotificationPreferencesModule } from './notification-preferences/notification-preferences.module';
import { ScheduleExceptionsModule } from './schedule-exceptions/schedule-exceptions.module';
import { DepotModule } from './depot/depot.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
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
    GusModule,
    PhotosModule,
    AdminModule,
    StationsModule,
    WorkersModule,
    WorkerTasksModule,
    BookingsModule,
    ReviewsModule,
    RealtimeModule,
    ServiceConfigsModule,
    ServicesModule,
    NotificationPreferencesModule,
    ScheduleExceptionsModule,
    DepotModule,
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
