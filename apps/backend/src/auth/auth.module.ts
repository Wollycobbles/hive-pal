// auth.module.ts
import { Module, forwardRef, OnModuleInit, Logger } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { jwtConstants } from './constants';
import { PrismaService } from '../prisma/prisma.service';
import { LoggerModule } from '../logger/logger.module';
import { MailModule } from '../mail/mail.module';
import { PasskeyModule } from './passkey/passkey.module';

const DEFAULT_JWT_SECRET = 'your-temporary-secret-key-change-this-in-production';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '7d' },
    }),
    LoggerModule,
    MailModule,
    PasskeyModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, PrismaService],
  exports: [AuthService, JwtModule],
})
export class AuthModule implements OnModuleInit {
  private readonly logger = new Logger(AuthModule.name);

  onModuleInit(): void {
    // Skip strict check in test environments to allow tests to run without secrets
    if (process.env.NODE_ENV === 'test') return;

    const secret = process.env.JWT_SECRET;
    if (!secret || secret === DEFAULT_JWT_SECRET || secret.length < 32) {
      throw new Error(
        '[AuthModule] JWT_SECRET is not configured correctly. ' +
          'Set JWT_SECRET to a cryptographically random string of at least 32 characters. ' +
          'Example: openssl rand -hex 32',
      );
    }
  }
}
