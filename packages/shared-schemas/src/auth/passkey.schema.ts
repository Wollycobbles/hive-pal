import { z } from 'zod';

// Options request for passkey registration (no body needed — user derived from JWT)
export const passkeyRegisterOptionsSchema = z.object({});

// Payload to verify a new passkey registration
export const passkeyRegisterVerifySchema = z.object({
  name: z.string().optional(),
  response: z.any(), // RegistrationResponseJSON from @simplewebauthn/browser
});

// Options request for passkey authentication (email is optional for usernameless flow)
export const passkeyAuthOptionsSchema = z.object({
  email: z.string().email().optional(),
});

// Payload to verify a passkey authentication
export const passkeyAuthVerifySchema = z.object({
  response: z.any(), // AuthenticationResponseJSON from @simplewebauthn/browser
});

// Shape returned when listing or creating passkeys
export const passkeyResponseSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  deviceType: z.string(),
  backedUp: z.boolean(),
  transports: z.array(z.string()),
  createdAt: z.string(),
  lastUsedAt: z.string().nullable(),
});

export type PasskeyRegisterOptions = z.infer<typeof passkeyRegisterOptionsSchema>;
export type PasskeyRegisterVerify = z.infer<typeof passkeyRegisterVerifySchema>;
export type PasskeyAuthOptions = z.infer<typeof passkeyAuthOptionsSchema>;
export type PasskeyAuthVerify = z.infer<typeof passkeyAuthVerifySchema>;
export type PasskeyResponse = z.infer<typeof passkeyResponseSchema>;
