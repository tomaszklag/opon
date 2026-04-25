import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Provider, ProviderStatus } from '@prisma/client';
import { CreateProviderDto } from './dto/create-provider.dto';
import { ListProvidersQueryDto } from './dto/list-providers-query.dto';
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
  constructor(private readonly repo: ProvidersRepository) {}

  async create(ownerId: string, dto: CreateProviderDto): Promise<Provider> {
    const existingByOwner = await this.repo.findByOwnerId(ownerId);
    if (existingByOwner) {
      throw new ConflictException('Masz już zarejestrowaną firmę.');
    }

    const existingByNip = await this.repo.findByNip(dto.nip);
    if (existingByNip) {
      throw new ConflictException('Podany NIP jest już zarejestrowany w systemie.');
    }

    try {
      return await this.repo.createWithOwnerPromotion(ownerId, dto);
    } catch (err) {
      // Prisma P2025 = Record not found during update (np. user usunięty między requestami)
      if ((err as { code?: string }).code === 'P2025') {
        throw new NotFoundException('Użytkownik nie istnieje.');
      }
      throw new InternalServerErrorException('Nie udało się zarejestrować firmy.');
    }
  }

  async getMyProvider(ownerId: string): Promise<Provider> {
    const provider = await this.repo.findByOwnerId(ownerId);
    if (!provider) {
      throw new NotFoundException('Nie masz zarejestrowanej firmy.');
    }
    return provider;
  }

  async updateMyProvider(ownerId: string, dto: UpdateProviderDto): Promise<Provider> {
    const provider = await this.repo.findByOwnerId(ownerId);
    if (!provider) {
      throw new NotFoundException('Nie masz zarejestrowanej firmy.');
    }
    return this.repo.update(provider.id, dto);
  }

  async getById(id: string): Promise<Provider> {
    const provider = await this.repo.findById(id);
    if (!provider) {
      throw new NotFoundException('Firma nie istnieje.');
    }
    return provider;
  }

  async getApprovedById(id: string): Promise<ProviderPublicView> {
    const provider = await this.getById(id);
    if (provider.status !== ProviderStatus.APPROVED) {
      // Celowo NotFoundException (nie Forbidden) — nie ujawniamy istnienia niepublicznych firm
      throw new NotFoundException('Firma nie istnieje lub nie jest dostępna.');
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

  /** Usuwa pola finansowe — używane przy publicznych endpointach. */
  private toPublicView(provider: Provider): ProviderPublicView {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { bankAccountIban, ...publicView } = provider;
    return publicView;
  }
}
