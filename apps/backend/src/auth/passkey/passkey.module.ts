import { Module } from '@nestjs/common';
import { PasskeyService } from './passkey.service.js';
import { PasskeyController } from './passkey.controller.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { JwtModule } from '@nestjs/jwt';
import { LoggerModule } from '../../logger/logger.module.js';
import { SystemConfigModule } from '../../system-config/system-config.module.js';
import { jwtConstants } from '../constants.js';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '7d' },
    }),
    LoggerModule,
    SystemConfigModule,
  ],
  controllers: [PasskeyController],
  providers: [PasskeyService, PrismaService],
  exports: [PasskeyService],
})
export class PasskeyModule {}