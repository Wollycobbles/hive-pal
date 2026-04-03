import { useRef, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  ShieldCheck,
  Upload,
  Trash2,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Info,
  Globe,
  KeyRound,
} from 'lucide-react';
import { useSslInfo, useUploadCertificate, useRemoveCertificate } from '@/api/hooks/useSsl';

function DaysRemaining({ days }: { days: number }) {
  if (days < 0)
    return <span className="text-red-600 font-medium">Expired</span>;
  if (days < 14)
    return <span className="text-orange-600 font-medium">{days} days remaining</span>;
  if (days < 30)
    return <span className="text-yellow-600 font-medium">{days} days remaining</span>;
  return <span className="text-green-600 font-medium">{days} days remaining</span>;
}

export const SslManagementPage = () => {
  const { data: certInfo, isLoading } = useSslInfo();
  const uploadCert = useUploadCertificate();
  const removeCert = useRemoveCertificate();

  const certFileRef = useRef<HTMLInputElement>(null);
  const keyFileRef = useRef<HTMLInputElement>(null);
  const [certFileName, setCertFileName] = useState('');
  const [keyFileName, setKeyFileName] = useState('');

  const readFile = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });

  const handleUpload = async () => {
    const certFile = certFileRef.current?.files?.[0];
    const keyFile = keyFileRef.current?.files?.[0];

    if (!certFile || !keyFile) {
      toast.error('Please select both a certificate and a private key file.');
      return;
    }

    try {
      const [certPem, keyPem] = await Promise.all([
        readFile(certFile),
        readFile(keyFile),
      ]);
      const info = await uploadCert.mutateAsync({ certPem, keyPem });
      toast.success('SSL certificate installed', {
        description: `Certificate for ${info.domain} is active. WebAuthn values updated automatically.`,
      });
      // Reset inputs
      setCertFileName('');
      setKeyFileName('');
      if (certFileRef.current) certFileRef.current.value = '';
      if (keyFileRef.current) keyFileRef.current.value = '';
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Upload failed. Check the certificate and key are a matching pair.';
      toast.error('Certificate upload failed', { description: msg });
    }
  };

  const handleRemove = async () => {
    try {
      await removeCert.mutateAsync();
      toast.success('Custom certificate removed', {
        description: 'Traefik will fall back to Let\'s Encrypt.',
      });
    } catch {
      toast.error('Failed to remove certificate');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-8 w-8" /> SSL Certificate
        </h1>
        <p className="text-muted-foreground mt-1">
          Upload a custom TLS certificate to enable HTTPS. WebAuthn passkey
          values are configured automatically from the certificate domain.
        </p>
      </div>

      <div className="space-y-6">
        {/* Current Certificate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" /> Current Certificate
            </CardTitle>
            <CardDescription>
              Status of the active SSL certificate
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading…
              </div>
            ) : certInfo ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {certInfo.isExpired ? (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  ) : (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  <span className="font-semibold text-lg">{certInfo.domain}</span>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                    Custom
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Valid until</p>
                    <p className="font-medium">
                      {new Date(certInfo.validTo).toLocaleDateString()}{' '}
                      <DaysRemaining days={certInfo.daysUntilExpiry} />
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Issued by</p>
                    <p className="font-medium truncate max-w-xs">{certInfo.issuer.replace(/\n/g, ', ')}</p>
                  </div>
                  {certInfo.sans.length > 0 && (
                    <div className="col-span-2">
                      <p className="text-muted-foreground">Subject Alt Names</p>
                      <p className="font-medium">{certInfo.sans.join(', ')}</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Auto-configured WebAuthn values */}
                <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                  <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">
                    Auto-configured Passkey Values
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">RP ID:</span>
                    <code className="bg-background px-1 rounded">{certInfo.webauthnRpId}</code>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <KeyRound className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Origin:</span>
                    <code className="bg-background px-1 rounded">{certInfo.webauthnOrigin}</code>
                  </div>
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleRemove}
                  disabled={removeCert.isPending}
                  className="gap-2"
                >
                  {removeCert.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Remove certificate
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Info className="h-5 w-5" />
                <p>No custom certificate uploaded. Traefik is using Let's Encrypt or its default certificate.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload New Certificate */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" /> Upload Certificate
            </CardTitle>
            <CardDescription>
              Upload a PEM-encoded certificate and its matching private key.
              The domain and passkey configuration will be set automatically.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Certificate file */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Certificate (.crt / .pem)</label>
                <div
                  className="flex items-center gap-2 rounded-md border border-dashed p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => certFileRef.current?.click()}
                >
                  <Upload className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground truncate">
                    {certFileName || 'Click to select certificate file'}
                  </span>
                </div>
                <input
                  ref={certFileRef}
                  type="file"
                  accept=".crt,.pem,.cer"
                  className="hidden"
                  onChange={e => setCertFileName(e.target.files?.[0]?.name ?? '')}
                />
              </div>

              {/* Private key file */}
              <div className="space-y-1">
                <label className="text-sm font-medium">Private Key (.key / .pem)</label>
                <div
                  className="flex items-center gap-2 rounded-md border border-dashed p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => keyFileRef.current?.click()}
                >
                  <KeyRound className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm text-muted-foreground truncate">
                    {keyFileName || 'Click to select private key file'}
                  </span>
                </div>
                <input
                  ref={keyFileRef}
                  type="file"
                  accept=".key,.pem"
                  className="hidden"
                  onChange={e => setKeyFileName(e.target.files?.[0]?.name ?? '')}
                />
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              The backend validates that the certificate and key are a matching pair and that the certificate is not expired before saving.
              The private key is stored with restricted permissions (mode 600) and is never returned by the API.
            </p>

            <Button
              onClick={handleUpload}
              disabled={uploadCert.isPending || (!certFileName && !keyFileName)}
              className="gap-2"
            >
              {uploadCert.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploadCert.isPending ? 'Installing certificate…' : 'Install certificate'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
