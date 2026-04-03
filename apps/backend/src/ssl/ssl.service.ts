import {
  Injectable,
  BadRequestException,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { SystemConfigService } from '../system-config/system-config.service.js';

export interface SslCertInfo {
  domain: string;
  sans: string[];
  issuer: string;
  validFrom: string;
  validTo: string;
  daysUntilExpiry: number;
  isExpired: boolean;
  isCustom: boolean;
  webauthnRpId: string;
  webauthnOrigin: string;
}

const CERT_FILE = 'custom.crt';
const KEY_FILE = 'custom.key';
const TRAEFIK_DYNAMIC_FILE = 'hivepal-custom-cert.yaml';

@Injectable()
export class SslService implements OnModuleInit {
  constructor(private readonly systemConfig: SystemConfigService) {}

  onModuleInit(): void {
    this.validateConfiguredPaths();
  }

  // Resolve to absolute and reject any path containing traversal sequences.
  // Relative paths are resolved against CWD (acceptable in dev; production
  // should always use absolute paths via env vars).
  private validateConfiguredPaths(): void {
    for (const [envVar, value] of [
      ['SSL_CERTS_PATH', this.certsPath],
      ['SSL_TRAEFIK_DYNAMIC_PATH', this.traefikDynamicPath],
    ] as [string, string][]) {
      if (path.normalize(value).includes('..')) {
        throw new Error(
          `${envVar} contains path traversal sequences (got "${value}"). ` +
            `Use a direct path without ".." segments.`,
        );
      }
    }
  }

  private get certsPath(): string {
    return process.env.SSL_CERTS_PATH ?? './ssl-certs';
  }

  private get traefikDynamicPath(): string {
    return process.env.SSL_TRAEFIK_DYNAMIC_PATH ?? './traefik-dynamic';
  }

  private get certFilePath(): string {
    return path.join(this.certsPath, CERT_FILE);
  }

  private get keyFilePath(): string {
    return path.join(this.certsPath, KEY_FILE);
  }

  private get traefikConfigPath(): string {
    return path.join(this.traefikDynamicPath, TRAEFIK_DYNAMIC_FILE);
  }

  async uploadCertificate(
    certPem: string,
    keyPem: string,
  ): Promise<SslCertInfo> {
    // Parse and validate the certificate
    let x509: crypto.X509Certificate;
    try {
      x509 = new crypto.X509Certificate(certPem);
    } catch {
      throw new BadRequestException(
        'Invalid certificate format. Please provide a valid PEM certificate.',
      );
    }

    // Validate private key can be parsed
    let privateKey: crypto.KeyObject;
    try {
      privateKey = crypto.createPrivateKey(keyPem);
    } catch {
      throw new BadRequestException(
        'Invalid private key format. Please provide a valid PEM private key.',
      );
    }

    // Verify the private key matches the certificate's public key.
    // Use createPublicKey(certPem) — Node.js extracts the public key from the
    // certificate PEM directly, avoiding the CryptoKey vs KeyObject mismatch
    // that occurs when using x509.publicKey on Node 18+.
    try {
      const pubKeyFromCert = crypto.createPublicKey(certPem);
      const pubKeyFromKey = crypto.createPublicKey(privateKey);
      const certPubDer = pubKeyFromCert.export({ type: 'spki', format: 'der' });
      const keyPubDer = pubKeyFromKey.export({ type: 'spki', format: 'der' });
      if (!(certPubDer as Buffer).equals(keyPubDer as Buffer)) {
        throw new BadRequestException(
          'Private key does not match the certificate. Please ensure they are a matching pair.',
        );
      }
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(
        'Could not verify key/certificate pair. Ensure both files are valid PEM format.',
      );
    }

    // Check expiry
    const validTo = new Date(x509.validTo);
    if (validTo < new Date()) {
      throw new BadRequestException(
        `Certificate expired on ${validTo.toISOString()}. Please upload a valid certificate.`,
      );
    }

    // Extract primary domain from SANs, falling back to CN
    const domain = this.extractPrimaryDomain(x509);
    if (!domain) {
      throw new BadRequestException(
        'Could not determine domain from certificate. Ensure the certificate has a Subject Alternative Name or Common Name.',
      );
    }

    // Write cert and key to disk
    fs.mkdirSync(this.certsPath, { recursive: true });
    fs.writeFileSync(this.certFilePath, certPem, { mode: 0o644 });
    fs.writeFileSync(this.keyFilePath, keyPem, { mode: 0o600 });

    // Write Traefik dynamic config — Traefik hot-reloads this automatically
    fs.mkdirSync(this.traefikDynamicPath, { recursive: true });
    fs.writeFileSync(
      this.traefikConfigPath,
      this.buildTraefikConfig(),
      { mode: 0o644 },
    );

    // Persist WebAuthn config derived from the certificate
    const webauthnRpId = domain;
    const webauthnOrigin = `https://${domain}`;
    await this.systemConfig.setPrivileged('WEBAUTHN_RP_ID', webauthnRpId);
    await this.systemConfig.setPrivileged('WEBAUTHN_ORIGIN', webauthnOrigin);
    await this.systemConfig.setPrivileged('SSL_ACTIVE', 'true');

    return this.buildCertInfo(x509, domain, true);
  }

  async getCertificateInfo(): Promise<SslCertInfo | null> {
    if (!fs.existsSync(this.certFilePath)) return null;

    try {
      const certPem = fs.readFileSync(this.certFilePath, 'utf-8');
      const x509 = new crypto.X509Certificate(certPem);
      const domain = this.extractPrimaryDomain(x509) ?? 'unknown';
      return this.buildCertInfo(x509, domain, true);
    } catch {
      return null;
    }
  }

  async removeCertificate(): Promise<void> {
    // Remove cert files
    [this.certFilePath, this.keyFilePath].forEach(f => {
      if (fs.existsSync(f)) fs.unlinkSync(f);
    });

    // Remove Traefik dynamic config so it falls back to Let's Encrypt
    if (fs.existsSync(this.traefikConfigPath)) {
      fs.unlinkSync(this.traefikConfigPath);
    }

    // Clear runtime WebAuthn overrides so env vars take over again
    await this.systemConfig.deletePrivileged('WEBAUTHN_RP_ID');
    await this.systemConfig.deletePrivileged('WEBAUTHN_ORIGIN');
    await this.systemConfig.deletePrivileged('SSL_ACTIVE');
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  private extractPrimaryDomain(x509: crypto.X509Certificate): string | null {
    // Prefer SANs (DNS entries) over the CN
    if (x509.subjectAltName) {
      const dnsEntries = x509.subjectAltName
        .split(',')
        .map(s => s.trim())
        .filter(s => s.startsWith('DNS:'))
        .map(s => s.replace(/^DNS:/, '').trim());

      // Prefer non-wildcard entries
      const nonWildcard = dnsEntries.find(d => !d.startsWith('*'));
      if (nonWildcard) return nonWildcard;
      if (dnsEntries[0]) return dnsEntries[0].replace(/^\*\./, '');
    }

    // Fall back to CN
    const cnMatch = x509.subject.match(/CN=([^,\n]+)/);
    return cnMatch?.[1]?.trim() ?? null;
  }

  private extractAllSans(x509: crypto.X509Certificate): string[] {
    if (!x509.subjectAltName) return [];
    return x509.subjectAltName
      .split(',')
      .map(s => s.trim())
      .filter(s => s.startsWith('DNS:'))
      .map(s => s.replace(/^DNS:/, '').trim());
  }

  private buildCertInfo(
    x509: crypto.X509Certificate,
    domain: string,
    isCustom: boolean,
  ): SslCertInfo {
    const validTo = new Date(x509.validTo);
    const now = new Date();
    const daysUntilExpiry = Math.floor(
      (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      domain,
      sans: this.extractAllSans(x509),
      issuer: x509.issuer,
      validFrom: new Date(x509.validFrom).toISOString(),
      validTo: validTo.toISOString(),
      daysUntilExpiry,
      isExpired: daysUntilExpiry < 0,
      isCustom,
      webauthnRpId: domain,
      webauthnOrigin: `https://${domain}`,
    };
  }

  private buildTraefikConfig(): string {
    // Paths inside the Traefik container (mounted from /data/hive-pal-data/certs)
    return `tls:
  certificates:
    - certFile: /certs/${CERT_FILE}
      keyFile: /certs/${KEY_FILE}
`;
  }
}
