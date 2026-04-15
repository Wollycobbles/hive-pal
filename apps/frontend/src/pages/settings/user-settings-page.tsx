import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { Globe, Bell, Palette, User, Save, Loader2, KeyRound, Trash2, ShieldCheck, Cloud } from 'lucide-react';
import { toast } from 'sonner';
import { usePreferences } from '@/api/hooks/useUserPreferences';
import { useTheme } from '@/context/use-theme';
import { UserPreferences } from 'shared-schemas';
import { normalizeLanguageCode } from '@/utils/language-utils';
import { LanguageSwitcher } from '@/components/language-switcher';
import { useListPasskeys, useRegisterPasskey, useDeletePasskey } from '@/api/hooks/usePasskey';

export const UserSettingsPage = () => {
  const { t, i18n } = useTranslation('common');
  const navigate = useNavigate();
  const { preferences, updatePreferences } = usePreferences();
  const { theme, setTheme } = useTheme();
  const { data: passkeys, isLoading: passkeysLoading } = useListPasskeys();
  const registerPasskey = useRegisterPasskey();
  const deletePasskey = useDeletePasskey();
  const [newPasskeyName, setNewPasskeyName] = useState('');

  const [settings, setSettings] = useState<Omit<UserPreferences, 'theme'>>({
    language: normalizeLanguageCode(i18n.language || 'en'),
    dateFormat: 'MM/DD/YYYY',
    units: 'metric',
    emailNotifications: true,
    pushNotifications: false,
    inspectionReminders: true,
    harvestReminders: true,
  });

  // Load preferences from API when available
  useEffect(() => {
    if (preferences.data) {
      setSettings({
        language: normalizeLanguageCode(
          preferences.data.language || i18n.language || 'en',
        ),
        dateFormat: preferences.data.dateFormat || 'MM/DD/YYYY',
        units: preferences.data.units || 'metric',
        emailNotifications: preferences.data.emailNotifications ?? true,
        pushNotifications: preferences.data.pushNotifications ?? false,
        inspectionReminders: preferences.data.inspectionReminders ?? true,
        harvestReminders: preferences.data.harvestReminders ?? true,
      });
    }
  }, [preferences.data, i18n.language]);

  const handleAddPasskey = async () => {
    try {
      await registerPasskey.mutateAsync(newPasskeyName || undefined);
      setNewPasskeyName('');
      toast.success('Passkey added', { description: 'You can now sign in with this passkey.' });
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'NotAllowedError') return;
      toast.error('Failed to add passkey', { description: 'Please try again.' });
    }
  };

  const handleDeletePasskey = async (id: string, name: string | null) => {
    try {
      await deletePasskey.mutateAsync(id);
      toast.success('Passkey removed', { description: `"${name ?? 'Passkey'}" has been deleted.` });
    } catch {
      toast.error('Failed to remove passkey');
    }
  };

  const handleSaveSettings = async () => {
    try {
      // Include theme from context with other settings
      await updatePreferences.mutateAsync({
        ...settings,
        theme,
      });
      toast.success(t('messages.changesSaved'), {
        description: t('settings.preferencesUpdated'),
      });
    } catch {
      toast.error(t('messages.errorOccurred'), {
        description: t('settings.failedToSavePreferences'),
      });
    }
  };

  const handleLanguageChange = (value: string) => {
    setSettings({ ...settings, language: normalizeLanguageCode(value) });
  };

  // Show loading state while fetching preferences
  if (preferences.isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t('navigation.settings')}</h1>
          <p className="text-muted-foreground">
            {t('settings.managePreferences')}
          </p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t('navigation.settings')}</h1>
        <p className="text-muted-foreground">
          {t('settings.managePreferences')}
        </p>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('settings.generalSettings')}
            </CardTitle>
            <CardDescription>
              {t('settings.configureLanguageRegional')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="language">{t('actions.language')}</Label>
                <LanguageSwitcher
                  variant="select"
                  onLanguageChange={handleLanguageChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFormat">{t('settings.dateFormat')}</Label>
                <Select
                  value={settings.dateFormat}
                  onValueChange={(value: UserPreferences['dateFormat']) =>
                    setSettings({ ...settings, dateFormat: value })
                  }
                >
                  <SelectTrigger id="dateFormat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                    <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                    <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="units">{t('settings.unitsOfMeasurement')}</Label>
              <Select
                value={settings.units}
                onValueChange={(value: 'metric' | 'imperial') =>
                  setSettings({ ...settings, units: value })
                }
              >
                <SelectTrigger id="units">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">{t('settings.metric')}</SelectItem>
                  <SelectItem value="imperial">
                    {t('settings.imperial')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Display Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {t('settings.displayPreferences')}
            </CardTitle>
            <CardDescription>
              {t('settings.customizeAppearance')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">{t('settings.theme')}</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t('settings.light')}</SelectItem>
                  <SelectItem value="dark">{t('settings.dark')}</SelectItem>
                  <SelectItem value="system">{t('settings.system')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t('settings.notificationPreferences')}
            </CardTitle>
            <CardDescription>
              {t('settings.chooseNotificationMethod')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">
                  {t('settings.emailNotifications')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.receiveEmailUpdates')}
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={settings.emailNotifications}
                onCheckedChange={checked =>
                  setSettings({ ...settings, emailNotifications: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">
                  {t('settings.pushNotifications')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.receiveBrowserNotifications')}
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={settings.pushNotifications}
                onCheckedChange={checked =>
                  setSettings({ ...settings, pushNotifications: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="inspection-reminders">
                  {t('settings.inspectionReminders')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.upcomingInspectionsNotify')}
                </p>
              </div>
              <Switch
                id="inspection-reminders"
                checked={settings.inspectionReminders}
                onCheckedChange={checked =>
                  setSettings({ ...settings, inspectionReminders: checked })
                }
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="harvest-reminders">
                  {t('settings.harvestReminders')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {t('settings.harvestSchedulesNotify')}
                </p>
              </div>
              <Switch
                id="harvest-reminders"
                checked={settings.harvestReminders}
                onCheckedChange={checked =>
                  setSettings({ ...settings, harvestReminders: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Passkey / Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Passkeys
            </CardTitle>
            <CardDescription>
              Sign in securely with Face ID, Touch ID, or a hardware key — no password required.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {passkeysLoading ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading passkeys…
              </div>
            ) : passkeys && passkeys.length > 0 ? (
              <div className="space-y-2">
                {passkeys.map(pk => (
                  <div
                    key={pk.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <KeyRound className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{pk.name ?? 'Passkey'}</p>
                        <p className="text-xs text-muted-foreground">
                          Added {new Date(pk.createdAt).toLocaleDateString()}
                          {pk.lastUsedAt && ` · Last used ${new Date(pk.lastUsedAt).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {pk.backedUp && (
                        <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                          <Cloud className="h-3 w-3" /> Synced
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeletePasskey(pk.id, pk.name)}
                        disabled={deletePasskey.isPending}
                        aria-label={`Remove passkey ${pk.name ?? ''}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No passkeys registered yet.</p>
            )}

            <Separator />

            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <Label htmlFor="passkey-name">New passkey name (optional)</Label>
                <input
                  id="passkey-name"
                  type="text"
                  value={newPasskeyName}
                  onChange={e => setNewPasskeyName(e.target.value)}
                  placeholder="e.g. MacBook Touch ID"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
              <Button
                onClick={handleAddPasskey}
                disabled={registerPasskey.isPending}
                className="gap-2 whitespace-nowrap"
              >
                {registerPasskey.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}
                Add passkey
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('settings.accountSettings')}
            </CardTitle>
            <CardDescription>{t('settings.manageAccountInfo')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{t('settings.password')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('settings.changePassword')}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate('/account/change-password')}
              >
                {t('settings.changePassword')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleSaveSettings}
            size="lg"
            className="gap-2"
            disabled={updatePreferences.isPending || preferences.isLoading}
          >
            {updatePreferences.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {updatePreferences.isPending
              ? t('settings.saving')
              : t('settings.saveSettings')}
          </Button>
        </div>
      </div>
    </div>
  );
};
