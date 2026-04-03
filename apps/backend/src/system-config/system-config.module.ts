import { Global, Module } from '@nestjs/common';
import { SystemConfigService } from './system-config.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Global()
@Module({
  providers: [SystemConfigService, PrismaService],
  exports: [SystemConfigService],
})
export class SystemConfigModule {}
