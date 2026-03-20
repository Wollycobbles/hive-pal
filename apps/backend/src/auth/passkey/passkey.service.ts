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
import type { AuthResponse, PasskeyResponse, SuccessResponse } from 'shared-schemas';

const CHALLENGE_TTL_MS = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class PasskeyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private get rpId(): string {
    return process.env.WEBAUTHN_RP_ID ?? 'localhost';
  }

  private get rpName(): string {
    return process.env.WEBAUTHN_RP_NAME ?? 'Hive Pal';
  }

  private get origin(): string {
    return process.env.WEBAUTHN_ORIGIN ?? 'http://localhost:5173';
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

    // Exclude credentials already registered on this account
    const excludeCredentials = user.passkeys.map(p => ({
      id: p.credentialId,
      transports: p.transports as AuthenticatorTransportFuture[],
    }));

    const options = await generateRegistrationOptions({
      rpName: this.rpName,
      rpID: this.rpId,
      userName: user.email,
      userDisplayName: user.name ?? user.email,
      // attestation omitted — defaults to 'none' (no attestation for consumer passkeys)
      authenticatorSelection: {
        residentKey: 'required', // discoverable credential = passkey
        userVerification: 'preferred',
        // authenticatorAttachment omitted → allows platform (Touch/Face ID) and roaming (hardware key)
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
    const challenge = await this.prisma.webAuthnChallenge.findFirst({
      where: { userId, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!challenge) {
      throw new BadRequestException(
        'No valid registration challenge found. Please start registration again.',
      );
    }

    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpId,
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

    const options = await generateAuthenticationOptions({
      rpID: this.rpId,
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

    // Find most recent unexpired challenge
    const challenge = await this.prisma.webAuthnChallenge.findFirst({
      where: { expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!challenge) {
      throw new UnauthorizedException(
        'No valid authentication challenge found. Please try again.',
      );
    }

    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challenge.challenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpId,
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
