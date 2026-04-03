import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/server';
import { PrismaService } from '../../prisma/prisma.service.js';
import { SystemConfigService } from '../../system-config/system-config.service.js';
import type { AuthResponse, PasskeyResponse, SuccessResponse } from 'shared-schemas';

const CHALLENGE_TTL_MS = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class PasskeyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly systemConfig: SystemConfigService,
  ) {}

  // DB config takes precedence over env vars — allows runtime updates via SSL cert upload
  private async getRpId(): Promise<string> {
    return (
      (await this.systemConfig.get('WEBAUTHN_RP_ID')) ??
      process.env.WEBAUTHN_RP_ID ??
      'localhost'
    );
  }

  private async getRpName(): Promise<string> {
    return process.env.WEBAUTHN_RP_NAME ?? 'Hive Pal';
  }

  // Returns all valid origins. The DB value (set from cert upload) uses the
  // bare domain; the env var may include a port for dev. Providing both lets
  // verifyRegistrationResponse / verifyAuthenticationResponse accept either.
  private async getOrigin(): Promise<string[]> {
    const envOrigin = process.env.WEBAUTHN_ORIGIN ?? 'http://localhost:5173';
    const dbOrigin = await this.systemConfig.get('WEBAUTHN_ORIGIN');
    const origins = [envOrigin];
    if (dbOrigin && dbOrigin !== envOrigin) origins.push(dbOrigin);
    return origins;
  }

  // ─── Registration ceremony ──────────────────────────────────────────────────

  async generateRegistrationOptions(
    userId: string,
  ): Promise<PublicKeyCredentialCreationOptionsJSON> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { passkeys: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const excludeCredentials = user.passkeys.map(p => ({
      id: p.credentialId,
      transports: p.transports as AuthenticatorTransportFuture[],
    }));

    const [rpId, rpName] = await Promise.all([this.getRpId(), this.getRpName()]);

    const options = await generateRegistrationOptions({
      rpName,
      rpID: rpId,
      userName: user.email,
      userDisplayName: user.name ?? user.email,
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'preferred',
      },
      excludeCredentials,
    });

    // Persist challenge before returning options
    await this.prisma.webAuthnChallenge.create({
      data: {
        userId,
        challenge: options.challenge,
        expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS),
      },
    });

    return options;
  }

  async verifyRegistration(
    userId: string,
    response: RegistrationResponseJSON,
    name?: string,
  ): Promise<PasskeyResponse> {
    const [challenge, rpId, origin] = await Promise.all([
      this.prisma.webAuthnChallenge.findFirst({
        where: { userId, expiresAt: { gt: new Date() } },
        orderBy: { createdAt: 'desc' },
      }),
      this.getRpId(),
      this.getOrigin(),
    ]);
    if (!challenge) {
      throw new BadRequestException(
        'No valid registration challenge found. Please start registration again.',
      );
    }

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: origin,
      expectedRPID: rpId,
    });

    if (!verification.verified || !verification.registrationInfo) {
      throw new BadRequestException('Passkey registration verification failed');
    }

    // Consume the used challenge
    await this.prisma.webAuthnChallenge.delete({ where: { id: challenge.id } });

    const { credential, credentialDeviceType, credentialBackedUp } =
      verification.registrationInfo;

    const passkey = await this.prisma.passkey.create({
      data: {
        userId,
        credentialId: credential.id,
        credentialPublicKey: Buffer.from(credential.publicKey),
        counter: BigInt(credential.counter),
        deviceType: credentialDeviceType,
        backedUp: credentialBackedUp,
        transports: (response.response.transports ?? []) as string[],
        name: name ?? null,
      },
    });

    return this.mapPasskey(passkey);
  }

  // ─── Authentication ceremony ─────────────────────────────────────────────────

  async generateAuthenticationOptions(
    email?: string,
  ): Promise<PublicKeyCredentialRequestOptionsJSON> {
    let allowCredentials:
      | { id: string; transports?: AuthenticatorTransportFuture[] }[]
      | undefined;
    let userId: string | undefined;

    if (email) {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: { passkeys: true },
      });
      if (user?.passkeys.length) {
        userId = user.id;
        allowCredentials = user.passkeys.map(p => ({
          id: p.credentialId,
          transports: p.transports as AuthenticatorTransportFuture[],
        }));
      }
    }

    const rpId = await this.getRpId();

    const options = await generateAuthenticationOptions({
      rpID: rpId,
      userVerification: 'preferred',
      allowCredentials,
    });

    await this.prisma.webAuthnChallenge.create({
      data: {
        userId: userId ?? null,
        challenge: options.challenge,
        expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS),
      },
    });

    return options;
  }

  async verifyAuthentication(
    response: AuthenticationResponseJSON,
  ): Promise<AuthResponse> {
    // Look up the registered passkey by credential ID
    const passkey = await this.prisma.passkey.findUnique({
      where: { credentialId: response.id },
      include: { user: true },
    });
    if (!passkey) {
      throw new UnauthorizedException('Passkey not recognised');
    }

    const [challenge, rpId, origin] = await Promise.all([
      // Bind challenge to the credential owner; also accept null-userId challenges
      // from usernameless/discoverable flows, but never accept another user's challenge.
      this.prisma.webAuthnChallenge.findFirst({
        where: {
          expiresAt: { gt: new Date() },
          OR: [{ userId: passkey.userId }, { userId: null }],
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.getRpId(),
      this.getOrigin(),
    ]);
    if (!challenge) {
      throw new UnauthorizedException(
        'No valid authentication challenge found. Please try again.',
      );
    }
    // Reject if the challenge was explicitly issued for a different user
    if (challenge.userId !== null && challenge.userId !== passkey.userId) {
      throw new UnauthorizedException('Challenge does not belong to this user');
    }

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: origin,
      expectedRPID: rpId,
      credential: {
        id: passkey.credentialId,
        publicKey: new Uint8Array(passkey.credentialPublicKey),
        counter: Number(passkey.counter),
        transports: passkey.transports as AuthenticatorTransportFuture[],
      },
    });

    if (!verification.verified) {
      throw new UnauthorizedException('Passkey authentication failed');
    }

    // Update counter, lastUsedAt, and user lastLoginAt atomically
    await Promise.all([
      this.prisma.webAuthnChallenge.delete({ where: { id: challenge.id } }),
      this.prisma.passkey.update({
        where: { id: passkey.id },
        data: {
          counter: BigInt(verification.authenticationInfo.newCounter),
          lastUsedAt: new Date(),
        },
      }),
      this.prisma.user.update({
        where: { id: passkey.userId },
        data: { lastLoginAt: new Date() },
      }),
    ]);

    const user = passkey.user;
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      name: user.name,
      passwordChangeRequired: user.passwordChangeRequired ?? false,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        passwordChangeRequired: user.passwordChangeRequired ?? false,
      },
    };
  }

  // ─── Passkey management ──────────────────────────────────────────────────────

  async listPasskeys(userId: string): Promise<PasskeyResponse[]> {
    const passkeys = await this.prisma.passkey.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    return passkeys.map(p => this.mapPasskey(p));
  }

  async deletePasskey(
    userId: string,
    passkeyId: string,
  ): Promise<SuccessResponse> {
    const passkey = await this.prisma.passkey.findUnique({
      where: { id: passkeyId },
    });
    if (!passkey || passkey.userId !== userId) {
      throw new NotFoundException('Passkey not found');
    }
    await this.prisma.passkey.delete({ where: { id: passkeyId } });
    return { message: 'Passkey deleted successfully' };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private mapPasskey(p: {
    id: string;
    name: string | null;
    deviceType: string;
    backedUp: boolean;
    transports: string[];
    createdAt: Date;
    lastUsedAt: Date | null;
  }): PasskeyResponse {
    return {
      id: p.id,
      name: p.name,
      deviceType: p.deviceType,
      backedUp: p.backedUp,
      transports: p.transports,
      createdAt: p.createdAt.toISOString(),
      lastUsedAt: p.lastUsedAt?.toISOString() ?? null,
    };
  }
}
