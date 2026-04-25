import { Injectable } from '@nestjs/common';
import { Prisma, Provider, ProviderStatus, ProviderType, UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type ProviderWithoutRelations = Provider;

@Injectable()
export class ProvidersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<Provider | null> {
    return this.prisma.provider.findUnique({ where: { id } });
  }

  findByOwnerId(ownerId: string): Promise<Provider | null> {
    return this.prisma.provider.findUnique({ where: { ownerId } });
  }

  findByNip(nip: string): Promise<Provider | null> {
    return this.prisma.provider.findUnique({ where: { nip } });
  }

  findMany(params: {
    type?: ProviderType;
    status: ProviderStatus;
    skip: number;
    take: number;
  }): Promise<Provider[]> {
    return this.prisma.provider.findMany({
      where: {
        status: params.status,
        ...(params.type && { type: params.type }),
      },
      skip: params.skip,
      take: params.take,
      orderBy: { avgRating: 'desc' },
    });
  }

  count(params: { type?: ProviderType; status: ProviderStatus }): Promise<number> {
    return this.prisma.provider.count({
      where: {
        status: params.status,
        ...(params.type && { type: params.type }),
      },
    });
  }

  update(id: string, data: Prisma.ProviderUpdateInput): Promise<Provider> {
    return this.prisma.provider.update({ where: { id }, data });
  }

  /**
   * Atomowa operacja: tworzy Provider i aktualizuje rolę właściciela do PROVIDER_OWNER.
   * Transakcja w repozytorium bo obejmuje dwie encje w tym samym DB write.
   */
  createWithOwnerPromotion(
    ownerId: string,
    data: Prisma.ProviderCreateWithoutOwnerInput,
  ): Promise<Provider> {
    return this.prisma.$transaction(async (tx) => {
      const provider = await tx.provider.create({
        data: { ...data, owner: { connect: { id: ownerId } } },
      });
      await tx.user.update({
        where: { id: ownerId },
        data: { role: UserRole.PROVIDER_OWNER },
      });
      return provider;
    });
  }
}
