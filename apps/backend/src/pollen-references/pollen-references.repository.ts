import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  PollenReferenceCreate,
  PollenReferenceUpdate,
  PollenRegion,
  PollenSeason,
} from 'shared-schemas';
import { toPrismaPollenSeasons } from './pollen-reference.mappers';

export interface PollenReferenceFilters {
  region?: PollenRegion;
  season?: PollenSeason[];
  colorGroup?: string;
  search?: string;
}

const pollenReferenceInclude = {
  pollenReferenceRegions: {
    orderBy: { region: 'asc' as const },
  },
} satisfies Prisma.PollenReferenceInclude;

@Injectable()
export class PollenReferencesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findActive(filters: PollenReferenceFilters) {
    return this.prisma.pollenReference.findMany({
      where: {
        active: true,
        ...(filters.colorGroup && {
          colorGroup: { equals: filters.colorGroup, mode: 'insensitive' },
        }),
        ...(filters.search && {
          plantName: { contains: filters.search, mode: 'insensitive' },
        }),
        ...this.buildRegionWhere(filters.region, filters.season),
      },
      include: pollenReferenceInclude,
      orderBy: [{ plantName: 'asc' }, { scientificName: 'asc' }],
    });
  }

  findAllAdmin() {
    return this.prisma.pollenReference.findMany({
      include: pollenReferenceInclude,
      orderBy: [{ active: 'desc' }, { plantName: 'asc' }],
    });
  }

  async create(data: PollenReferenceCreate) {
    return this.prisma.pollenReference.create({
      data: this.toCreateInput(data),
      include: pollenReferenceInclude,
    });
  }

  async update(id: string, data: PollenReferenceUpdate) {
    await this.ensureExists(id);

    return this.prisma.pollenReference.update({
      where: { id },
      data: this.toUpdateInput(data),
      include: pollenReferenceInclude,
    });
  }

  async setActive(id: string, active: boolean) {
    await this.ensureExists(id);

    return this.prisma.pollenReference.update({
      where: { id },
      data: { active },
      include: pollenReferenceInclude,
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);

    return this.prisma.pollenReference.delete({
      where: { id },
    });
  }

  private async ensureExists(id: string) {
    const record = await this.prisma.pollenReference.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!record) {
      throw new NotFoundException(`Pollen reference with id ${id} not found`);
    }
  }

  private buildRegionWhere(region?: PollenRegion, season?: PollenSeason[]) {
    if (!region && (!season || season.length === 0)) {
      return {};
    }

    return {
      pollenReferenceRegions: {
        some: {
          ...(region && { region }),
          ...(season && season.length > 0 && {
            seasons: { hasSome: toPrismaPollenSeasons(season) },
          }),
        },
      },
    };
  }

  private mapRegionInputs(
    regions: PollenReferenceCreate['regions'],
  ) {
    return regions.map((region) => ({
      region: region.region,
      seasons: toPrismaPollenSeasons(region.seasons),
      notes: region.notes ?? null,
    }));
  }

  private mapCreateCoreFields(data: PollenReferenceCreate) {
    return {
      plantName: data.plantName,
      scientificName: data.scientificName ?? null,
      colorLabel: data.colorLabel,
      colorGroup: data.colorGroup,
      hexColor: data.hexColor,
      notes: data.notes ?? null,
      active: data.active,
    };
  }

  private mapUpdateCoreFields(data: Omit<PollenReferenceUpdate, 'id' | 'regions'>) {
    return {
      ...(data.plantName !== undefined && { plantName: data.plantName }),
      ...(data.scientificName !== undefined && {
        scientificName: data.scientificName,
      }),
      ...(data.colorLabel !== undefined && { colorLabel: data.colorLabel }),
      ...(data.colorGroup !== undefined && { colorGroup: data.colorGroup }),
      ...(data.hexColor !== undefined && { hexColor: data.hexColor }),
      ...(data.notes !== undefined && { notes: data.notes }),
      ...(data.active !== undefined && { active: data.active }),
    };
  }

  private toCreateInput(data: PollenReferenceCreate): Prisma.PollenReferenceCreateInput {
    return {
      ...this.mapCreateCoreFields(data),
      pollenReferenceRegions: {
        create: this.mapRegionInputs(data.regions),
      },
    };
  }

  private toUpdateInput(data: PollenReferenceUpdate): Prisma.PollenReferenceUpdateInput {
    const { regions, ...rest } = data;

    return {
      ...this.mapUpdateCoreFields(rest),
      ...(regions && {
        pollenReferenceRegions: {
          deleteMany: {},
          create: this.mapRegionInputs(regions),
        },
      }),
    };
  }
}
