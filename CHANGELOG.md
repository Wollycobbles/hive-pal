# Changelog

## [Unreleased] — feature/passkey-authentication

> Branch diff against `main` · 2026-03-20

### Overview

Implements FIDO2 WebAuthn passkey authentication for Hive Pal. Users can now register and sign in using platform authenticators (Face ID, Touch ID, Windows Hello) or hardware security keys. Syncable / cloud-backed passkeys (Apple Passkeys, Google Password Manager) are supported automatically — the `backedUp` flag on each credential indicates whether it is synced across devices.

The existing JWT-based email/password flow is fully preserved. Passkeys are an additive, optional second sign-in method managed from the user settings page.

---

### Added

#### Packages
- **`@simplewebauthn/server`** (backend) — FIDO2 ceremony implementation (registration + authentication)
- **`@simplewebauthn/browser`** (frontend) — browser-side WebAuthn helpers

#### Database
- **`Passkey` model** — stores registered FIDO2 credentials per user
  - Fields: `id`, `userId`, `credentialId` (unique, base64url), `credentialPublicKey` (COSE bytes), `counter` (BigInt, replay protection), `deviceType` (`singleDevice` | `multiDevice`), `backedUp` (synced across devices), `transports`, `name`, `createdAt`, `lastUsedAt`
  - Cascade-deletes with parent `User`; indexed on `userId`
- **`WebAuthnChallenge` model** — short-lived (5 min TTL) challenge store for ongoing ceremonies
  - Fields: `id`, `userId` (nullable), `challenge`, `expiresAt`, `createdAt`
  - Indexed on `userId` and `expiresAt`
- **`User.password`** changed from `String` → `String?` (nullable) to support future passwordless-only accounts

#### Migration
- `prisma/migrations/20260320_add_passkeys/migration.sql`

#### API Endpoints
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/passkey/register/options` | JWT | Generate registration challenge & options |
| `POST` | `/api/auth/passkey/register/verify` | JWT | Verify authenticator response & store credential |
| `POST` | `/api/auth/passkey/authenticate/options` | Public | Generate authentication challenge (email optional) |
| `POST` | `/api/auth/passkey/authenticate/verify` | Public | Verify assertion & return JWT |
| `GET` | `/api/auth/passkey` | JWT | List user's registered passkeys |
| `DELETE` | `/api/auth/passkey/:id` | JWT | Remove a passkey by ID |

#### Backend — `PasskeyModule`
- `apps/backend/src/auth/passkey/passkey.module.ts`
- `apps/backend/src/auth/passkey/passkey.service.ts` — full registration and authentication ceremony logic
- `apps/backend/src/auth/passkey/passkey.controller.ts`
- Imported into `AuthModule`

#### Frontend
- **`usePasskey.ts`** hooks (`apps/frontend/src/api/hooks/usePasskey.ts`)
  - `useListPasskeys` — query for enrolled passkeys
  - `useRegisterPasskey` — mutation: options → browser ceremony → verify
  - `useAuthenticatePasskey` — mutation: options → browser ceremony → verify → JWT
  - `useDeletePasskey` — mutation to remove a passkey
- **Login page** — "Sign in with a passkey" button with divider below the password form; gracefully ignores `NotAllowedError` (user dismissed prompt)
- **User settings page** — new **Passkeys** card (below notification preferences):
  - Lists enrolled passkeys with name, creation date, last-used date
  - **Synced** badge (blue, cloud icon) for `backedUp: true` credentials
  - Add passkey button (optional name field → browser prompt → stored)
  - Delete button per passkey

#### Shared Schemas
- `packages/shared-schemas/src/auth/passkey.schema.ts` — Zod schemas and TypeScript types:
  - `PasskeyRegisterVerify`, `PasskeyAuthOptions`, `PasskeyAuthVerify`, `PasskeyResponse`

#### Configuration
- New environment variables (added to `.env.example`):
  ```
  WEBAUTHN_RP_ID=localhost          # domain only, no protocol
  WEBAUTHN_RP_NAME=Hive Pal
  WEBAUTHN_ORIGIN=http://localhost:5173   # full origin including protocol
  ```

---

### Changed

- `apps/backend/src/auth/auth.service.ts` — guard `bcrypt.compare` against nullable `password` field
- `apps/backend/src/auth/auth.module.ts` — import `PasskeyModule`
- `apps/backend/prisma/schema.prisma` — `User.password` nullable; `Passkey[]` relation added to `User`

---

### Notes

- Syncable passkeys are identified automatically via `deviceType: 'multiDevice'` and `backedUp: true` in the authenticator response — no extra configuration is needed.
- `authenticatorAttachment` is intentionally omitted in `generateRegistrationOptions`, allowing both platform authenticators (built-in biometrics) and roaming authenticators (USB/NFC hardware keys).
- Challenge sessions use the `WebAuthnChallenge` Prisma table — no Redis dependency.
- The `password` field is now nullable; existing rows retain their passwords. New passwordless-only registration is possible in a future iteration.
