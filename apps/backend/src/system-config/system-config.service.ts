import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

// Keys that directly affect authentication security. General application code must
// not overwrite them; only the SSL admin workflow may do so via setPrivileged().
const PROTECTED_KEYS = new Set(['WEBAUTHN_RP_ID', 'WEBAUTHN_ORIGIN', 'SSL_ACTIVE']);

@Injectable()
export class SystemConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async get(key: string): Promise<string | null> {
    const record = await this.prisma.systemConfig.findUnique({ where: { key } });
    return record?.value ?? null;
  }

  /** General-purpose write. Throws if the key is a protected security setting. */
  async set(key: string, value: string): Promise<void> {
    if (PROTECTED_KEYS.has(key)) {
      throw new ForbiddenException(
        `"${key}" is a protected security key and cannot be set via set(). ` +
          `Use setPrivileged() from an admin-only context.`,
      );
    }
    await this.upsert(key, value);
  }

  /** General-purpose delete. Throws if the key is a protected security setting. */
  async delete(key: string): Promise<void> {
    if (PROTECTED_KEYS.has(key)) {
      throw new ForbiddenException(
        `"${key}" is a protected security key and cannot be deleted via delete(). ` +
          `Use deletePrivileged() from an admin-only context.`,
      );
    }
    await this.prisma.systemConfig.deleteMany({ where: { key } });
  }

  /** Admin-only write for security-sensitive keys (e.g. from SslService). */
  async setPrivileged(key: string, value: string): Promise<void> {
    await this.upsert(key, value);
  }

  /** Admin-only delete for security-sensitive keys (e.g. from SslService). */
  async deletePrivileged(key: string): Promise<void> {
    await this.prisma.systemConfig.deleteMany({ where: { key } });
  }

  async getMany(keys: string[]): Promise<Record<string, string>> {
    const records = await this.prisma.systemConfig.findMany({
      where: { key: { in: keys } },
    });
    return Object.fromEntries(records.map(r => [r.key, r.value]));
  }

  private async upsert(key: string, value: string): Promise<void> {
    await this.prisma.systemConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}
