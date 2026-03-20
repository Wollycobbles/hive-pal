import { Module } from '@nestjs/common';
import { PasskeyService } from './passkey.service.js';
import { PasskeyController } from './passkey.controller.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { JwtModule } from '@nestjs/jwt';
import { LoggerModule } from '../../logger/logger.module.js';

@Module({
  imports: [JwtModule, LoggerModule],
  controllers: [PasskeyController],
  providers: [PasskeyService, PrismaService],
  exports: [PasskeyService],
})
export class PasskeyModule {}
