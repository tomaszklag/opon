import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PhotosRepository } from './photos.repository';
import { PhotosService } from './photos.service';
import { PhotoType } from './dto/upload-photo.dto';

const makeFile = (name = 'photo.jpg'): Express.Multer.File =>
  ({
    path: `/tmp/${name}`,
    originalname: name,
    mimetype: 'image/jpeg',
    size: 512_000,
  }) as Express.Multer.File;

const makePhoto = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 'photo-1',
  providerId: 'provider-1',
  url: '/uploads/providers/provider-1/photo.jpg',
  storageKey: 'providers/provider-1/photo.jpg',
  type: 'LOGO',
  isPrimary: false,
  size: 512_000,
  mimeType: 'image/jpeg',
  originalName: 'photo.jpg',
  createdAt: new Date(),
  ...overrides,
});

describe('PhotosService', () => {
  let service: PhotosService;
  let repo: jest.Mocked<PhotosRepository>;

  beforeEach(async () => {
    const repoMock: Partial<jest.Mocked<PhotosRepository>> = {
      countByProviderAndType: jest.fn().mockResolvedValue(0),
      findByProvider: jest.fn().mockResolvedValue([]),
      findById: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(makePhoto()),
      delete: jest.fn().mockResolvedValue(undefined),
      setPrimary: jest.fn().mockResolvedValue(makePhoto({ isPrimary: true })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [PhotosService, { provide: PhotosRepository, useValue: repoMock }],
    }).compile();

    service = module.get(PhotosService);
    repo = module.get(PhotosRepository);
  });

  // ── upload ────────────────────────────────────────────────────────────────

  it('creates a new photo record with relative storageKey', async () => {
    const file = makeFile('logo.jpg');
    await service.upload('provider-1', file, PhotoType.LOGO);

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        providerId: 'provider-1',
        storageKey: expect.stringMatching(/^providers\/provider-1\//),
        url: expect.stringMatching(/^\/uploads\/providers\/provider-1\//),
      }),
    );
  });

  it('rejects additional upload when limit of 10 is reached', async () => {
    repo.countByProviderAndType.mockResolvedValue(10);

    await expect(
      service.upload('provider-1', makeFile(), PhotoType.ADDITIONAL),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(repo.create).not.toHaveBeenCalled();
  });

  it('replaces existing single-slot photo after creating the new record', async () => {
    const existing = makePhoto({ id: 'old-photo', type: 'LOGO' });
    repo.findByProvider.mockResolvedValue([existing] as never);

    await service.upload('provider-1', makeFile(), PhotoType.LOGO);

    // New record must be created before the old one is deleted
    expect(repo.create).toHaveBeenCalled();
    expect(repo.delete).toHaveBeenCalledWith('old-photo');
  });

  it('does NOT replace when type is ADDITIONAL', async () => {
    repo.countByProviderAndType.mockResolvedValue(3);
    await service.upload('provider-1', makeFile(), PhotoType.ADDITIONAL);

    // findByProvider should not be called for ADDITIONAL type
    expect(repo.findByProvider).not.toHaveBeenCalled();
    expect(repo.create).toHaveBeenCalled();
  });

  // ── remove ────────────────────────────────────────────────────────────────

  it('throws NotFoundException when photo does not exist', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(service.remove('provider-1', 'missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('throws ForbiddenException when photo belongs to a different provider', async () => {
    repo.findById.mockResolvedValue(makePhoto({ providerId: 'other-provider' }) as never);

    await expect(service.remove('provider-1', 'photo-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  // ── setPrimary ────────────────────────────────────────────────────────────

  it('throws NotFoundException when setting primary on non-existent photo', async () => {
    repo.findById.mockResolvedValue(null);

    await expect(service.setPrimary('provider-1', 'missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('delegates setPrimary to repository for valid photo', async () => {
    repo.findById.mockResolvedValue(makePhoto() as never);
    const result = await service.setPrimary('provider-1', 'photo-1');

    expect(repo.setPrimary).toHaveBeenCalledWith('provider-1', 'photo-1');
    expect(result.isPrimary).toBe(true);
  });
});
