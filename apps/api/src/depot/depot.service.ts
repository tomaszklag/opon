import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TireSetStatus } from '@prisma/client';
import { DepotRepository } from './depot.repository';
import { CreateTireSetDto } from './dto/create-tire-set.dto';
import { UpdateTireSetDto } from './dto/update-tire-set.dto';
import { DepotListQueryDto } from './dto/depot-list-query.dto';
import { UpsertDepotSlotsDto } from './dto/upsert-depot-slots.dto';
import { TireSetResponseDto } from './dto/tire-set-response.dto';
import { TireSetDetailResponseDto } from './dto/tire-set-detail-response.dto';
import { TireSetPageResponseDto } from './dto/tire-set-page-response.dto';
import { DepotStatsResponseDto } from './dto/depot-stats-response.dto';
import { DepotSlotResponseDto } from './dto/depot-slot-response.dto';
import { StoragePeriodResponseDto } from './dto/storage-period-response.dto';

@Injectable()
export class DepotService {
  constructor(private readonly repo: DepotRepository) {}

  private slotLabel(slot: {
    section: string;
    row: number;
    position: number;
    label: string | null;
  }): string {
    return slot.label ?? `${slot.section}${slot.row}-${slot.position}`;
  }

  private clientName(ts: {
    client: { firstName: string | null; lastName: string | null; phone: string };
  }): string {
    return (
      [ts.client.firstName, ts.client.lastName].filter(Boolean).join(' ').trim() || ts.client.phone
    );
  }

  private mapToResponse(ts: any): TireSetResponseDto {
    const activePeriod = ts.periods?.[0] ?? null;
    return {
      id: ts.id,
      clientName: this.clientName(ts),
      clientPhone: ts.client.phone,
      vehicleName: ts.vehicleName,
      licensePlate: ts.licensePlate,
      brand: ts.brand,
      model: ts.model,
      tireSize: ts.tireSize,
      tireType: ts.tireType,
      isOnRims: ts.isOnRims,
      condition: ts.condition,
      status: ts.status,
      slotId: ts.slotId,
      slotLabel: ts.slot ? this.slotLabel(ts.slot) : null,
      storagePricePln: ts.storagePricePln !== null ? Number(ts.storagePricePln) : null,
      releaseDue: activePeriod?.releaseDue?.toISOString() ?? null,
      createdAt: ts.createdAt.toISOString(),
    };
  }

  private mapPeriod(p: any): StoragePeriodResponseDto {
    return {
      id: p.id,
      storedAt: p.storedAt.toISOString(),
      releaseDue: p.releaseDue?.toISOString() ?? null,
      pickedUpAt: p.pickedUpAt?.toISOString() ?? null,
      pricePln: p.pricePln !== null ? Number(p.pricePln) : null,
      notes: p.notes,
    };
  }

  private mapToDetail(ts: any): TireSetDetailResponseDto {
    return {
      id: ts.id,
      clientId: ts.clientId,
      clientName: this.clientName(ts),
      clientPhone: ts.client.phone,
      vehicleName: ts.vehicleName,
      licensePlate: ts.licensePlate,
      brand: ts.brand,
      model: ts.model,
      tireSize: ts.tireSize,
      tireType: ts.tireType,
      isOnRims: ts.isOnRims,
      dotCode: ts.dotCode,
      treadDepthMm: ts.treadDepthMm,
      condition: ts.condition,
      slotId: ts.slotId,
      slotLabel: ts.slot ? this.slotLabel(ts.slot) : null,
      status: ts.status,
      storagePricePln: ts.storagePricePln !== null ? Number(ts.storagePricePln) : null,
      sourceBookingId: ts.sourceBookingId,
      notes: ts.notes,
      createdAt: ts.createdAt.toISOString(),
      updatedAt: ts.updatedAt.toISOString(),
      periods: ts.periods.map((p: any) => this.mapPeriod(p)),
    };
  }

  async list(providerId: string, query: DepotListQueryDto): Promise<TireSetPageResponseDto> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 50;
    const { items, total } = await this.repo.findMany(providerId, {
      status: query.status,
      search: query.search,
      page,
      pageSize,
    });
    return { items: items.map((ts) => this.mapToResponse(ts)), total, page, pageSize };
  }

  async getStats(providerId: string): Promise<DepotStatsResponseDto> {
    return this.repo.getStats(providerId);
  }

  async getById(providerId: string, id: string): Promise<TireSetDetailResponseDto> {
    const ts = await this.repo.findById(providerId, id);
    if (!ts) throw new NotFoundException('TireSet not found');
    return this.mapToDetail(ts);
  }

  async create(providerId: string, dto: CreateTireSetDto): Promise<TireSetDetailResponseDto> {
    const ts = await this.repo.create({
      providerId,
      clientPhone: dto.clientPhone,
      clientName: dto.clientName,
      vehicleName: dto.vehicleName,
      licensePlate: dto.licensePlate,
      brand: dto.brand,
      model: dto.model,
      tireSize: dto.tireSize,
      tireType: dto.tireType,
      isOnRims: dto.isOnRims,
      dotCode: dto.dotCode,
      treadDepthMm: dto.treadDepthMm,
      slotId: dto.slotId,
      storagePricePln: dto.storagePricePln,
      storedAt: dto.storedAt ? new Date(dto.storedAt) : undefined,
      releaseDue: dto.releaseDue ? new Date(dto.releaseDue) : undefined,
      sourceBookingId: dto.sourceBookingId,
      notes: dto.notes,
    });
    return this.mapToDetail(ts);
  }

  async update(
    providerId: string,
    id: string,
    dto: UpdateTireSetDto,
  ): Promise<TireSetDetailResponseDto> {
    const existing = await this.repo.findById(providerId, id);
    if (!existing) throw new NotFoundException('TireSet not found');

    const ts = await this.repo.update(providerId, id, {
      vehicleName: dto.vehicleName,
      licensePlate: dto.licensePlate,
      brand: dto.brand,
      model: dto.model,
      tireSize: dto.tireSize,
      tireType: dto.tireType,
      isOnRims: dto.isOnRims,
      dotCode: dto.dotCode,
      treadDepthMm: dto.treadDepthMm,
      condition: dto.condition,
      slotId: dto.slotId,
      storagePricePln: dto.storagePricePln,
      notes: dto.notes,
    });
    return this.mapToDetail(ts);
  }

  async pickup(providerId: string, id: string): Promise<TireSetDetailResponseDto> {
    const existing = await this.repo.findById(providerId, id);
    if (!existing) throw new NotFoundException('TireSet not found');
    if (existing.status !== TireSetStatus.IN_DEPOT) {
      throw new BadRequestException('TireSet is not currently in depot');
    }
    const ts = await this.repo.pickup(providerId, id);
    return this.mapToDetail(ts);
  }

  async store(
    providerId: string,
    id: string,
    data: { storedAt?: string; releaseDue?: string; pricePln?: number; notes?: string },
  ): Promise<TireSetDetailResponseDto> {
    const existing = await this.repo.findById(providerId, id);
    if (!existing) throw new NotFoundException('TireSet not found');
    if (existing.status !== TireSetStatus.PICKED_UP) {
      throw new BadRequestException('TireSet is already in depot');
    }
    const ts = await this.repo.store(providerId, id, {
      storedAt: data.storedAt ? new Date(data.storedAt) : undefined,
      releaseDue: data.releaseDue ? new Date(data.releaseDue) : undefined,
      pricePln: data.pricePln,
      notes: data.notes,
    });
    return this.mapToDetail(ts);
  }

  async remove(providerId: string, id: string): Promise<void> {
    const existing = await this.repo.findById(providerId, id);
    if (!existing) throw new NotFoundException('TireSet not found');
    if (existing.status !== TireSetStatus.PICKED_UP) {
      throw new BadRequestException('Only picked-up tire sets can be deleted');
    }
    await this.repo.remove(providerId, id);
  }

  private mapSlot(s: any): DepotSlotResponseDto {
    const ts = s.tireSets[0] ?? null;
    const clientName = ts?.client
      ? [ts.client.firstName, ts.client.lastName].filter(Boolean).join(' ').trim() || null
      : null;
    return {
      id: s.id,
      section: s.section,
      row: s.row,
      position: s.position,
      label: s.label,
      occupied: s.tireSets.length > 0,
      tireSetId: ts?.id ?? null,
      tireSetClientName: clientName,
    };
  }

  async getSlots(providerId: string): Promise<DepotSlotResponseDto[]> {
    const slots = await this.repo.findSlots(providerId);
    return slots.map((s) => this.mapSlot(s));
  }

  async bulkCreateSlots(
    providerId: string,
    dto: UpsertDepotSlotsDto,
  ): Promise<DepotSlotResponseDto[]> {
    const slots = await this.repo.bulkCreateSlots(
      providerId,
      dto.section,
      dto.rowFrom,
      dto.rowTo,
      dto.positionsPerRow,
    );
    return slots.map((s) => this.mapSlot(s));
  }

  async removeSlot(providerId: string, slotId: string): Promise<void> {
    const slots = await this.repo.findSlots(providerId);
    const slot = slots.find((s) => s.id === slotId);
    if (!slot) throw new NotFoundException('Slot not found');
    if (slot.tireSets.length > 0) throw new BadRequestException('Slot is occupied');
    await this.repo.removeSlot(providerId, slotId);
  }
}
