import { Injectable } from '@nestjs/common';
import {
  DataExportRequest,
  DataExportStatus,
  PhotoType,
  Prisma,
  Provider,
  ProviderStatus,
  ProviderType,
  UserRole,
} from '@prisma/client';
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

  // ── Photos ─────────────────────────────────────────────────────────────────

  async getPhotos(providerId: string) {
    return this.prisma.providerPhoto.findMany({
      where: { providerId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async addPhoto(providerId: string, url: string, type: PhotoType) {
    const count = await this.prisma.providerPhoto.count({ where: { providerId } });
    return this.prisma.providerPhoto.create({
      data: {
        providerId,
        url,
        storageKey: url,
        type: type ?? PhotoType.WORKSPACE,
        isPrimary: count === 0,
        size: 0,
        mimeType: 'image/jpeg',
        originalName: url,
      },
    });
  }

  async deletePhoto(id: string, providerId: string) {
    const photo = await this.prisma.providerPhoto.findFirst({ where: { id, providerId } });
    if (!photo) return null;
    await this.prisma.providerPhoto.delete({ where: { id } });
    if (photo.isPrimary) {
      const next = await this.prisma.providerPhoto.findFirst({
        where: { providerId },
        orderBy: { createdAt: 'asc' },
      });
      if (next)
        await this.prisma.providerPhoto.update({
          where: { id: next.id },
          data: { isPrimary: true },
        });
    }
    return photo;
  }

  async reorderPhotos(providerId: string, orderedIds: string[]) {
    return this.prisma.$transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx.providerPhoto.updateMany({
          where: { id: orderedIds[i], providerId },
          data: { isPrimary: i === 0 },
        });
      }
    });
  }

  // ── Data Export Requests ───────────────────────────────────────────────────

  findPendingDataExportRequest(providerId: string): Promise<DataExportRequest | null> {
    return this.prisma.dataExportRequest.findFirst({
      where: { providerId, status: DataExportStatus.PENDING },
    });
  }

  createDataExportRequest(providerId: string): Promise<DataExportRequest> {
    return this.prisma.dataExportRequest.create({ data: { providerId } });
  }

  setPause(providerId: string, pausedUntil: Date | null) {
    return this.prisma.provider.update({
      where: { id: providerId },
      data: { pausedUntil },
    });
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
