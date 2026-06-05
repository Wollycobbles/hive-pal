import { Module } from '@nestjs/common';
import { AdminPollenReferencesController } from './admin-pollen-references.controller';
import { PollenReferencesController } from './pollen-references.controller';
import { PollenReferencesRepository } from './pollen-references.repository';
import { PollenReferencesService } from './pollen-references.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [PollenReferencesController, AdminPollenReferencesController],
  providers: [PollenReferencesService, PollenReferencesRepository, PrismaService],
  exports: [PollenReferencesService, PollenReferencesRepository],
})
export class PollenReferencesModule {}
