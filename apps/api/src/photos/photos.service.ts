import * as fs from 'fs';
import * as path from 'path';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PhotoType as PrismaPhotoType, ProviderPhoto } from '@prisma/client';
import { PhotoType } from './dto/upload-photo.dto';
import { PhotosRepository } from './photos.repository';

const MAX_ADDITIONAL = 10;
const SINGLE_SLOT_TYPES: PhotoType[] = [PhotoType.LOGO, PhotoType.VEHICLE, PhotoType.WORKSPACE];

const UPLOADS_ROOT = path.join(process.cwd(), 'uploads');

@Injectable()
export class PhotosService {
  constructor(private readonly repo: PhotosRepository) {}

  async upload(
    providerId: string,
    file: Express.Multer.File,
    type: PhotoType,
  ): Promise<ProviderPhoto> {
    const prismaType = type as unknown as PrismaPhotoType;

    if (type === PhotoType.ADDITIONAL) {
      const count = await this.repo.countByProviderAndType(providerId, prismaType);
      if (count >= MAX_ADDITIONAL) {
        throw new BadRequestException(
          `Można dodać maksymalnie ${MAX_ADDITIONAL} zdjęć dodatkowych.`,
        );
      }
    }

    // Locate existing single-slot photo BEFORE creating the new record.
    let toReplace: ProviderPhoto | undefined;
    if (SINGLE_SLOT_TYPES.includes(type)) {
      const all = await this.repo.findByProvider(providerId);
      toReplace = all.find((p) => p.type === prismaType);
    }

    // Store a relative key so the path survives container restarts / moves.
    const filename = path.basename(file.path);
    const storageKey = `providers/${providerId}/${filename}`;
    const url = `/uploads/${storageKey}`;

    // Create new record first — if this throws nothing is deleted yet.
    const photo = await this.repo.create({
      providerId,
      url,
      storageKey,
      type: prismaType,
      size: file.size,
      mimeType: file.mimetype,
      originalName: file.originalname,
    });

    // Only after a successful insert, clean up the old entry.
    if (toReplace) {
      await this.deleteFile(toReplace.storageKey);
      await this.repo.delete(toReplace.id).catch(() => {
        // DB delete failing after file removal is non-fatal — the record
        // will be an orphan but won't block the user.
      });
    }

    return photo;
  }

  findByProvider(providerId: string): Promise<ProviderPhoto[]> {
    return this.repo.findByProvider(providerId);
  }

  async remove(providerId: string, photoId: string): Promise<void> {
    const photo = await this.repo.findById(photoId);
    if (!photo) throw new NotFoundException('Zdjęcie nie istnieje.');
    if (photo.providerId !== providerId)
      throw new ForbiddenException('Brak dostępu do tego zdjęcia.');

    await this.deleteFile(photo.storageKey);
    await this.repo.delete(photoId);
  }

  async rename(providerId: string, photoId: string, name: string): Promise<ProviderPhoto> {
    const photo = await this.repo.findById(photoId);
    if (!photo) throw new NotFoundException('Zdjęcie nie istnieje.');
    if (photo.providerId !== providerId)
      throw new ForbiddenException('Brak dostępu do tego zdjęcia.');
    return this.repo.rename(photoId, name);
  }

  async setPrimary(providerId: string, photoId: string): Promise<ProviderPhoto> {
    const photo = await this.repo.findById(photoId);
    if (!photo) throw new NotFoundException('Zdjęcie nie istnieje.');
    if (photo.providerId !== providerId)
      throw new ForbiddenException('Brak dostępu do tego zdjęcia.');

    return this.repo.setPrimary(providerId, photoId);
  }

  /** Resolves a relative storageKey to an absolute path and removes the file. */
  private deleteFile(storageKey: string): Promise<void> {
    const absPath =
      storageKey.startsWith('/') || /^[A-Za-z]:/.test(storageKey)
        ? storageKey // legacy absolute path — handle gracefully
        : path.join(UPLOADS_ROOT, storageKey);

    return new Promise((resolve) => {
      fs.unlink(absPath, (err) => {
        if (err) console.warn(`Could not delete file: ${absPath}`, err.message);
        resolve();
      });
    });
  }
}
