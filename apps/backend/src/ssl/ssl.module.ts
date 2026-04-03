import { Module } from '@nestjs/common';
import { SslService } from './ssl.service.js';
import { SslController } from './ssl.controller.js';
import { LoggerModule } from '../logger/logger.module.js';
import { SystemConfigModule } from '../system-config/system-config.module.js';

@Module({
  imports: [LoggerModule, SystemConfigModule],
  controllers: [SslController],
  providers: [SslService],
  exports: [SslService],
})
export class SslModule {}
