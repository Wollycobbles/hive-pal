import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../client';
import { logApiError } from '../errorLogger';

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

const SSL_KEYS = {
  info: ['ssl', 'info'] as const,
};

export const useSslInfo = () =>
  useQuery<SslCertInfo | null>({
    queryKey: SSL_KEYS.info,
    queryFn: async () => {
      const res = await apiClient.get<SslCertInfo | null>('/api/admin/ssl/info');
      return res.data;
    },
    refetchOnWindowFocus: false,
  });

export const useUploadCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { certPem: string; keyPem: string }) => {
      const res = await apiClient.post<SslCertInfo>('/api/admin/ssl/upload', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SSL_KEYS.info });
    },
    onError: error => {
      logApiError(error, '/api/admin/ssl/upload', 'POST');
    },
  });
};

export const useRemoveCertificate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await apiClient.delete<{ message: string }>('/api/admin/ssl/certificate');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SSL_KEYS.info });
    },
    onError: error => {
      logApiError(error, '/api/admin/ssl/certificate', 'DELETE');
    },
  });
};
