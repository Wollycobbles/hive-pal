import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  pollenReferenceAdminListItemSchema,
  pollenReferenceRegionSchema,
  pollenReferenceUserReadSchema,
  type PollenReferenceAdminListItem,
  type PollenReferenceCreate,
  type PollenReferenceUpdate,
  type PollenReferenceUserRead,
} from 'shared-schemas';
import { PollenReferenceListQuery } from './pollen-reference.query';
import { PollenReferencesRepository } from './pollen-references.repository';
import { PrismaPollenSeason, toPollenSeasons } from './pollen-reference.mappers';

type PollenReferenceWithRegions = {
  id: string;
  plantName: string;
  scientificName: string | null;
  colorLabel: string;
  colorGroup: string;
  hexColor: string;
  notes: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  pollenReferenceRegions: Array<{
    region: string;
    seasons: PrismaPollenSeason[];
    notes: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }>;
};

@Injectable()
export class PollenReferencesService {
  constructor(private readonly repository: PollenReferencesRepository) {}

  async listActive(
    query: PollenReferenceListQuery,
  ): Promise<PollenReferenceUserRead[]> {
    const records = await this.repository.findActive({
      region: query.region,
      season: query.season,
      colorGroup: query.colorGroup,
      search: query.search,
    });

    return records.map((record) => this.toUserRead(record, query.region));
  }

  async listAllAdmin(): Promise<PollenReferenceAdminListItem[]> {
    const records = await this.repository.findAllAdmin();

    return records.map((record) => this.toAdminListItem(record));
  }

  async create(data: PollenReferenceCreate): Promise<PollenReferenceAdminListItem> {
    const record = await this.repository.create(data);
    return this.toAdminListItem(record);
  }

  async update(
    id: string,
    data: PollenReferenceUpdate,
  ): Promise<PollenReferenceAdminListItem> {
    const record = await this.repository.update(id, data);
    return this.toAdminListItem(record);
  }

  async activate(id: string): Promise<PollenReferenceAdminListItem> {
    const record = await this.repository.setActive(id, true);
    return this.toAdminListItem(record);
  }

  async deactivate(id: string): Promise<PollenReferenceAdminListItem> {
    const record = await this.repository.setActive(id, false);
    return this.toAdminListItem(record);
  }

  async remove(id: string) {
    return this.repository.remove(id);
  }

  private toBaseReferenceDto(
    record: PollenReferenceWithRegions,
    region?: string,
  ) {
    return {
      id: record.id,
      plantName: record.plantName,
      scientificName: record.scientificName,
      colorLabel: record.colorLabel,
      colorGroup: record.colorGroup,
      hexColor: record.hexColor,
      notes: record.notes,
      regions: this.normalizeRegions(record.pollenReferenceRegions, region),
    };
  }

  private toUserRead(
    record: PollenReferenceWithRegions,
    region?: string,
  ): PollenReferenceUserRead {
    return pollenReferenceUserReadSchema.parse(
      this.toBaseReferenceDto(record, region),
    );
  }

  private toAdminListItem(
    record: PollenReferenceWithRegions,
  ): PollenReferenceAdminListItem {
    return pollenReferenceAdminListItemSchema.parse({
      ...this.toBaseReferenceDto(record),
      active: record.active,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
    });
  }

  private normalizeRegions(
    regions: PollenReferenceWithRegions['pollenReferenceRegions'],
    region?: string,
  ) {
    const filteredRegions = region
      ? regions.filter((item) => item.region === region)
      : regions;

    return filteredRegions.map((item) => {
      const parsed = pollenReferenceRegionSchema.safeParse({
        region: item.region,
        seasons: toPollenSeasons(item.seasons),
        notes: item.notes,
      });

      if (!parsed.success) {
        throw new InternalServerErrorException(
          `Invalid pollen reference region data for ${item.region}`,
        );
      }

      return parsed.data;
    });
  }
}
