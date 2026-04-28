import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Provider, ProviderStatus } from '@prisma/client';
import { EmailService } from '../email/email.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdminProviderListQueryDto } from './dto/admin-provider-list-query.dto';

export type AdminProviderPage = {
  data: Provider[];
  total: number;
  page: number;
  limit: number;
};

@Injectable()
export class AdminProvidersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
  ) {}

  async listProviders(query: AdminProviderListQueryDto): Promise<AdminProviderPage> {
    const skip = (query.page - 1) * query.limit;
    const where = query.status ? { status: query.status } : {};

    const [data, total] = await Promise.all([
      this.prisma.provider.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.provider.count({ where }),
    ]);

    return { data, total, page: query.page, limit: query.limit };
  }

  async approveProvider(id: string): Promise<Provider> {
    const provider = await this.prisma.provider.findUnique({ where: { id } });
    if (!provider) throw new NotFoundException('Firma nie istnieje.');
    if (provider.status !== ProviderStatus.PENDING_APPROVAL)
      throw new BadRequestException('Firma nie jest w stanie oczekującym na weryfikację.');
    const updated = await this.prisma.provider.update({
      where: { id },
      data: { status: ProviderStatus.APPROVED, approvedAt: new Date() },
    });
    if (provider.email) {
      await this.emailService.sendAccountApproved(provider.id, provider.email, provider.name);
    }
    return updated;
  }

  async rejectProvider(id: string, reason?: string): Promise<Provider> {
    const provider = await this.prisma.provider.findUnique({ where: { id } });
    if (!provider) throw new NotFoundException('Firma nie istnieje.');
    if (provider.status !== ProviderStatus.PENDING_APPROVAL)
      throw new BadRequestException('Firma nie jest w stanie oczekującym na weryfikację.');
    const updated = await this.prisma.provider.update({
      where: { id },
      data: { status: ProviderStatus.REJECTED },
    });
    if (provider.email) {
      await this.emailService.sendAccountRejected(
        provider.id,
        provider.email,
        provider.name,
        reason,
      );
    }
    return updated;
  }
}
