import { Injectable } from '@nestjs/common';
import { DataExportStatus } from '@prisma/client';
import { AppException, ErrorCode } from '../common/errors';
import { PrismaService } from '../prisma/prisma.service';

export interface DataExportRequestDto {
  id: string;
  providerId: string;
  providerName: string;
  providerNip: string;
  providerEmail: string | null;
  status: DataExportStatus;
  requestedAt: string;
  completedAt: string | null;
}

export interface DataExportPage {
  data: DataExportRequestDto[];
  total: number;
}

@Injectable()
export class AdminDataExportService {
  constructor(private readonly prisma: PrismaService) {}

  async listPending(): Promise<DataExportPage> {
    const [rows, total] = await Promise.all([
      this.prisma.dataExportRequest.findMany({
        where: { status: DataExportStatus.PENDING },
        orderBy: { requestedAt: 'asc' },
        include: { provider: { select: { name: true, nip: true, email: true } } },
      }),
      this.prisma.dataExportRequest.count({ where: { status: DataExportStatus.PENDING } }),
    ]);

    return {
      data: rows.map((r) => ({
        id: r.id,
        providerId: r.providerId,
        providerName: r.provider.name,
        providerNip: r.provider.nip,
        providerEmail: r.provider.email,
        status: r.status,
        requestedAt: r.requestedAt.toISOString(),
        completedAt: r.completedAt?.toISOString() ?? null,
      })),
      total,
    };
  }

  async complete(id: string): Promise<{ ok: boolean }> {
    const req = await this.prisma.dataExportRequest.findUnique({ where: { id } });
    if (!req) throw new AppException(ErrorCode.DATA_EXPORT_NOT_FOUND, 'Wniosek nie istnieje.', 404);
    if (req.status !== DataExportStatus.PENDING)
      throw new AppException(
        ErrorCode.DATA_EXPORT_NOT_FOUND,
        'Wniosek nie jest w stanie oczekującym.',
        400,
      );
    await this.prisma.dataExportRequest.update({
      where: { id },
      data: { status: DataExportStatus.COMPLETED, completedAt: new Date() },
    });
    return { ok: true };
  }

  async cancel(id: string): Promise<{ ok: boolean }> {
    const req = await this.prisma.dataExportRequest.findUnique({ where: { id } });
    if (!req) throw new AppException(ErrorCode.DATA_EXPORT_NOT_FOUND, 'Wniosek nie istnieje.', 404);
    if (req.status !== DataExportStatus.PENDING)
      throw new AppException(
        ErrorCode.DATA_EXPORT_NOT_FOUND,
        'Wniosek nie jest w stanie oczekującym.',
        400,
      );
    await this.prisma.dataExportRequest.update({
      where: { id },
      data: { status: DataExportStatus.CANCELLED },
    });
    return { ok: true };
  }
}
