import { Injectable } from '@nestjs/common';
import { PhotoType, Provider, ProviderStatus } from '@prisma/client';
import { AppException, ErrorCode } from '../common/errors';
import { EmailService } from '../email/email.service';
import { EmailVerificationService } from '../email/email-verification.service';
import { AddPhotoDto } from './dto/add-photo.dto';
import { CreateProviderDto } from './dto/create-provider.dto';
import { ListProvidersQueryDto } from './dto/list-providers-query.dto';
import { ProviderPauseResponseDto } from './dto/provider-pause-response.dto';
import { ReorderPhotosDto } from './dto/reorder-photos.dto';
import { UpdateProviderDto } from './dto/update-provider.dto';
import { ProvidersRepository } from './providers.repository';

/** Widok publiczny — bez danych finansowych właściciela. */
export type ProviderPublicView = Omit<Provider, 'bankAccountIban'>;

export type ProviderPage = {
  data: ProviderPublicView[];
  total: number;
  page: number;
  limit: number;
};

@Injectable()
export class ProvidersService {
  constructor(
    private readonly repo: ProvidersRepository,
    private readonly emailService: EmailService,
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  async create(ownerId: string, dto: CreateProviderDto): Promise<Provider> {
    const existingByOwner = await this.repo.findByOwnerId(ownerId);
    if (existingByOwner) {
      throw new AppException(
        ErrorCode.PROVIDER_ALREADY_EXISTS,
        'Masz już zarejestrowaną firmę.',
        409,
      );
    }

    const existingByNip = await this.repo.findByNip(dto.nip);
    if (existingByNip) {
      throw new AppException(
        ErrorCode.PROVIDER_NIP_CONFLICT,
        'Podany NIP jest już zarejestrowany w systemie.',
        409,
      );
    }

    try {
      const createdProvider = await this.repo.createWithOwnerPromotion(ownerId, {
        ...dto,
        status: ProviderStatus.PENDING_DOCS,
      });
      if (createdProvider.email) {
        await this.emailVerificationService.createAndSend(
          createdProvider.id,
          createdProvider.email,
        );
      }
      return createdProvider;
    } catch (err) {
      if (err instanceof AppException) throw err;
      // Prisma P2025 = Record not found during update (np. user usunięty między requestami)
      if ((err as { code?: string }).code === 'P2025') {
        throw new AppException(ErrorCode.AUTH_USER_NOT_FOUND, 'Użytkownik nie istnieje.', 404);
      }
      throw new AppException(
        ErrorCode.PROVIDER_CREATE_FAILED,
        'Nie udało się zarejestrować firmy.',
        500,
      );
    }
  }

  async getMyProvider(ownerId: string): Promise<Provider> {
    const provider = await this.repo.findByOwnerId(ownerId);
    if (!provider) {
      throw new AppException(
        ErrorCode.PROVIDER_OWNER_NOT_FOUND,
        'Nie masz zarejestrowanej firmy.',
        404,
      );
    }
    return provider;
  }

  async updateMyProvider(ownerId: string, dto: UpdateProviderDto): Promise<Provider> {
    const provider = await this.repo.findByOwnerId(ownerId);
    if (!provider) {
      throw new AppException(
        ErrorCode.PROVIDER_OWNER_NOT_FOUND,
        'Nie masz zarejestrowanej firmy.',
        404,
      );
    }
    return this.repo.update(provider.id, dto);
  }

  async submitForApproval(ownerId: string): Promise<Provider> {
    const provider = await this.repo.findByOwnerId(ownerId);
    if (!provider) {
      throw new AppException(
        ErrorCode.PROVIDER_OWNER_NOT_FOUND,
        'Nie masz zarejestrowanej firmy.',
        404,
      );
    }
    if (provider.status !== ProviderStatus.PENDING_DOCS) {
      throw new AppException(
        ErrorCode.PROVIDER_INVALID_STATUS,
        'Zgłoszenie zostało już wysłane lub firma jest w nieprawidłowym stanie.',
        400,
      );
    }
    const updated = await this.repo.update(provider.id, {
      status: ProviderStatus.PENDING_APPROVAL,
      submittedAt: new Date(),
    });
    if (provider.email) {
      await this.emailService.sendSubmissionReceived(provider.id, provider.email, provider.name);
    }
    return updated;
  }

  async getById(id: string): Promise<Provider> {
    const provider = await this.repo.findById(id);
    if (!provider) {
      throw new AppException(ErrorCode.PROVIDER_NOT_FOUND, 'Firma nie istnieje.', 404);
    }
    return provider;
  }

  async getApprovedById(id: string): Promise<ProviderPublicView> {
    const provider = await this.getById(id);
    if (provider.status !== ProviderStatus.APPROVED) {
      // Celowo NOT_FOUND (nie Forbidden) — nie ujawniamy istnienia niepublicznych firm
      throw new AppException(
        ErrorCode.PROVIDER_NOT_FOUND,
        'Firma nie istnieje lub nie jest dostępna.',
        404,
      );
    }
    return this.toPublicView(provider);
  }

  async listApproved(query: ListProvidersQueryDto): Promise<ProviderPage> {
    const skip = (query.page - 1) * query.limit;
    const filter = { type: query.type, status: ProviderStatus.APPROVED };

    const [providers, total] = await Promise.all([
      this.repo.findMany({ ...filter, skip, take: query.limit }),
      this.repo.count(filter),
    ]);

    return {
      data: providers.map((p) => this.toPublicView(p)),
      total,
      page: query.page,
      limit: query.limit,
    };
  }

  // ── Photos ─────────────────────────────────────────────────────────────────

  async getMyPhotos(ownerId: string) {
    const provider = await this.getMyProvider(ownerId);
    return this.repo.getPhotos(provider.id);
  }

  async addPhoto(ownerId: string, dto: AddPhotoDto) {
    const provider = await this.getMyProvider(ownerId);
    return this.repo.addPhoto(provider.id, dto.url, dto.type ?? PhotoType.WORKSPACE);
  }

  async deletePhoto(ownerId: string, photoId: string) {
    const provider = await this.getMyProvider(ownerId);
    const deleted = await this.repo.deletePhoto(photoId, provider.id);
    if (!deleted)
      throw new AppException(ErrorCode.PROVIDER_NOT_FOUND, 'Zdjęcie nie istnieje.', 404);
  }

  async reorderPhotos(ownerId: string, dto: ReorderPhotosDto) {
    const provider = await this.getMyProvider(ownerId);
    await this.repo.reorderPhotos(provider.id, dto.orderedIds);
  }

  async setProviderPause(ownerId: string, until: string | null): Promise<ProviderPauseResponseDto> {
    const provider = await this.repo.findByOwnerId(ownerId);
    if (!provider) throw new AppException(ErrorCode.PROVIDER_NOT_FOUND, 'Brak firmy.', 404);
    const pausedUntil = until ? new Date(until) : null;
    await this.repo.setPause(provider.id, pausedUntil);
    return { pausedUntil: pausedUntil?.toISOString() ?? null };
  }

  /** Usuwa pola finansowe — używane przy publicznych endpointach. */
  private toPublicView(provider: Provider): ProviderPublicView {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { bankAccountIban, ...publicView } = provider;
    return publicView;
  }
}
