import { Injectable } from '@nestjs/common';
import { ProviderPhoto, PhotoType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface CreatePhotoData {
  providerId: string;
  url: string;
  storageKey: string;
  type: PhotoType;
  size: number;
  mimeType: string;
  originalName: string;
}

@Injectable()
export class PhotosRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByProvider(providerId: string): Promise<ProviderPhoto[]> {
    return this.prisma.providerPhoto.findMany({
      where: { providerId },
      orderBy: { createdAt: 'asc' },
    });
  }

  findById(id: string): Promise<ProviderPhoto | null> {
    return this.prisma.providerPhoto.findUnique({ where: { id } });
  }

  countByProvider(providerId: string): Promise<number> {
    return this.prisma.providerPhoto.count({ where: { providerId } });
  }

  countByProviderAndType(providerId: string, type: PhotoType): Promise<number> {
    return this.prisma.providerPhoto.count({ where: { providerId, type } });
  }

  create(data: CreatePhotoData): Promise<ProviderPhoto> {
    return this.prisma.providerPhoto.create({ data });
  }

  delete(id: string): Promise<ProviderPhoto> {
    return this.prisma.providerPhoto.delete({ where: { id } });
  }

  rename(id: string, name: string): Promise<ProviderPhoto> {
    return this.prisma.providerPhoto.update({
      where: { id },
      data: { originalName: name },
    });
  }

  async setPrimary(providerId: string, photoId: string): Promise<ProviderPhoto> {
    const [, updated] = await this.prisma.$transaction([
      // Odznacz wszystkie jako niepierwszoplanowe w ramach providera
      this.prisma.providerPhoto.updateMany({
        where: { providerId, isPrimary: true },
        data: { isPrimary: false },
      }),
      // Ustaw wskazane zdjęcie jako pierwsze
      this.prisma.providerPhoto.update({
        where: { id: photoId },
        data: { isPrimary: true },
      }),
    ]);

    return updated;
  }
}
