import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';
import { apiClient } from '../client';
import { logApiError } from '../errorLogger';
import type { PasskeyResponse, AuthResponse } from 'shared-schemas';

const PASSKEY_KEYS = {
  all: ['passkeys'] as const,
  list: () => [...PASSKEY_KEYS.all, 'list'] as const,
};

// List all passkeys for the current user
export const useListPasskeys = () =>
  useQuery<PasskeyResponse[]>({
    queryKey: PASSKEY_KEYS.list(),
    queryFn: async () => {
      const response = await apiClient.get<PasskeyResponse[]>(
        '/api/auth/passkey',
      );
      return response.data;
    },
    refetchOnWindowFocus: false,
  });

// Register a new passkey (must be called from a user-gesture handler)
export const useRegisterPasskey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name?: string) => {
      // 1. Fetch options from server
      const optionsRes = await apiClient.post<ReturnType<typeof Object>>(
        '/api/auth/passkey/register/options',
        {},
      );

      // 2. Trigger the browser WebAuthn ceremony
      const attResp = await startRegistration({
        optionsJSON: optionsRes.data as Parameters<typeof startRegistration>[0]['optionsJSON'],
      });

      // 3. Send the credential to the server for verification
      const verifyRes = await apiClient.post<PasskeyResponse>(
        '/api/auth/passkey/register/verify',
        { name, response: attResp },
      );
      return verifyRes.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PASSKEY_KEYS.list() });
    },
    onError: (error) => {
      logApiError(error, '/api/auth/passkey/register', 'POST');
    },
  });
};

// Authenticate with a passkey — returns an AuthResponse with access_token
export const useAuthenticatePasskey = () =>
  useMutation({
    mutationFn: async (email?: string) => {
      // 1. Fetch options (pass email for non-usernameless flow)
      const optionsRes = await apiClient.post<ReturnType<typeof Object>>(
        '/api/auth/passkey/authenticate/options',
        email ? { email } : {},
      );

      // 2. Trigger the browser authentication ceremony
      const authResp = await startAuthentication({
        optionsJSON: optionsRes.data as Parameters<typeof startAuthentication>[0]['optionsJSON'],
      });

      // 3. Verify with the server and receive JWT
      const verifyRes = await apiClient.post<AuthResponse>(
        '/api/auth/passkey/authenticate/verify',
        { response: authResp },
      );
      return verifyRes.data;
    },
    onError: (error) => {
      logApiError(error, '/api/auth/passkey/authenticate', 'POST');
    },
  });

// Delete a passkey by ID
export const useDeletePasskey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (passkeyId: string) => {
      const response = await apiClient.delete<{ message: string }>(
        `/api/auth/passkey/${passkeyId}`,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PASSKEY_KEYS.list() });
    },
    onError: (error) => {
      logApiError(error, '/api/auth/passkey/:id', 'DELETE');
    },
  });
};
