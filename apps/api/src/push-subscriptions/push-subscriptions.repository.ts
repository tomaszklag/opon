import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterPushSubscriptionDto } from './dto/register-push-subscription.dto';

@Injectable()
export class PushSubscriptionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  upsert(providerId: string, dto: RegisterPushSubscriptionDto) {
    return this.prisma.pushSubscription.upsert({
      where: { providerId_endpoint: { providerId, endpoint: dto.endpoint } },
      create: { providerId, ...dto },
      update: { p256dh: dto.p256dh, auth: dto.auth, userAgent: dto.userAgent },
    });
  }

  deleteByEndpoint(providerId: string, endpoint: string) {
    return this.prisma.pushSubscription.deleteMany({
      where: { providerId, endpoint },
    });
  }

  findByProvider(providerId: string) {
    return this.prisma.pushSubscription.findMany({ where: { providerId } });
  }
}
