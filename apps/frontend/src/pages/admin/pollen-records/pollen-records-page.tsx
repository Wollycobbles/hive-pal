import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { CheckCircle2, Loader2, Pencil, RefreshCw, Trash2 } from 'lucide-react';
import {
  getErrorMessage,
  useActivateAdminPollenReference,
  useDeactivateAdminPollenReference,
  useDeleteAdminPollenReference,
  useAdminPollenReferences,
} from '@/api/hooks/useAdminPollenReferences';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getSeasonLabel } from '@/utils/pollen-utils';
import { PollenRecordFormDialog } from './components/pollen-record-form-dialog';
import type { PollenReferenceAdminListItem } from 'shared-schemas';

type PendingAction = {
  record: PollenReferenceAdminListItem;
  type: 'delete' | 'activate' | 'deactivate';
};

const PollenRecordsPage = () => {
  const { t } = useTranslation('common');
  const {
    data: records,
    isLoading,
    isError,
    error,
    refetch,
  } = useAdminPollenReferences();
  const deleteMutation = useDeleteAdminPollenReference();
  const activateMutation = useActivateAdminPollenReference();
  const deactivateMutation = useDeactivateAdminPollenReference();
  const [editorRecord, setEditorRecord] = useState<PollenReferenceAdminListItem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const actionMessage = useMemo(() => {
    if (!pendingAction) {
      return null;
    }

    const plantName = pendingAction.record.plantName;

    switch (pendingAction.type) {
      case 'delete':
        return {
          title: t('adminPollenRecords.dialogs.deleteTitle'),
          description: t('adminPollenRecords.dialogs.deleteDescription', {
            plantName,
          }),
          confirmLabel: t('actions.delete'),
          destructive: true,
        };
      case 'activate':
        return {
          title: t('adminPollenRecords.dialogs.activateTitle'),
          description: t('adminPollenRecords.dialogs.activateDescription', {
            plantName,
          }),
          confirmLabel: t('adminPollenRecords.dialogs.activateConfirm'),
          destructive: false,
        };
      case 'deactivate':
        return {
          title: t('adminPollenRecords.dialogs.deactivateTitle'),
          description: t('adminPollenRecords.dialogs.deactivateDescription', {
            plantName,
          }),
          confirmLabel: t('adminPollenRecords.dialogs.deactivateConfirm'),
          destructive: false,
        };
      default:
        return null;
    }
  }, [pendingAction, t]);

  const listErrorMessage = isError
    ? getErrorMessage(
        error,
        t('adminPollenRecords.messages.error', {
          defaultValue: 'Failed to load pollen records',
        }),
      )
    : null;

  const isPendingAction =
    deleteMutation.isPending || activateMutation.isPending || deactivateMutation.isPending;

  const openCreate = () => {
    setEditorRecord(null);
    setIsEditorOpen(true);
  };

  const openEdit = (record: PollenReferenceAdminListItem) => {
    setEditorRecord(record);
    setIsEditorOpen(true);
  };

  const requestAction = (record: PollenReferenceAdminListItem, type: PendingAction['type']) => {
    setPendingAction({ record, type });
  };

  const confirmPendingAction = async () => {
    if (!pendingAction) {
      return;
    }

    try {
      if (pendingAction.type === 'delete') {
        await deleteMutation.mutateAsync(pendingAction.record.id);
      } else if (pendingAction.type === 'activate') {
        await activateMutation.mutateAsync(pendingAction.record.id);
      } else {
        await deactivateMutation.mutateAsync(pendingAction.record.id);
      }

      setPendingAction(null);
    } catch {
      // Mutation hooks already surface errors via toast notifications.
    }
  };

  return (
    <div className="container mx-auto space-y-6 py-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>{t('adminPollenRecords.title')}</CardTitle>
              <CardDescription>{t('adminPollenRecords.description')}</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {t('actions.refresh')}
              </Button>
              <Button onClick={openCreate}>{t('adminPollenRecords.create')}</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isError ? (
            <div className="mb-4 space-y-3">
              <Alert variant="destructive">
                <AlertDescription>{listErrorMessage}</AlertDescription>
              </Alert>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => void refetch()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {t('actions.refresh')}
                </Button>
              </div>
            </div>
          ) : null}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('adminPollenRecords.table.plant')}</TableHead>
                  <TableHead>{t('adminPollenRecords.table.colour')}</TableHead>
                  <TableHead>{t('adminPollenRecords.table.regions')}</TableHead>
                  <TableHead>{t('adminPollenRecords.table.status')}</TableHead>
                  <TableHead>{t('adminPollenRecords.table.updated')}</TableHead>
                  <TableHead className="text-right">{t('adminPollenRecords.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      {t('adminPollenRecords.messages.loading')}
                    </TableCell>
                  </TableRow>
                ) : isError ? null : (records?.length ?? 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                      {t('adminPollenRecords.messages.empty')}
                    </TableCell>
                  </TableRow>
                ) : (
                  records?.map(record => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{record.plantName}</div>
                          <div className="text-sm text-muted-foreground">
                            {record.scientificName || '—'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="h-5 w-5 rounded border"
                            style={{ backgroundColor: record.hexColor }}
                          />
                          <div>
                            <div>{record.colorLabel}</div>
                            <div className="text-xs text-muted-foreground">
                              {t(`pollenIdentification.colorGroups.${record.colorGroup}`)} · {record.hexColor}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1 text-sm">
                          {record.regions.map(region => (
                            <div key={region.region}>
                              {t(`pollenIdentification.scope.${region.region}`)} ·{' '}
                              {region.seasons
                                .map(season => getSeasonLabel(season, key => t(key)))
                                .join(', ')}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={record.active ? 'default' : 'secondary'}>
                          {record.active
                            ? t('adminPollenRecords.status.active')
                            : t('adminPollenRecords.status.inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(record.updatedAt), 'yyyy-MM-dd')}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(record)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {t('actions.edit')}
                          </Button>
                          {record.active ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => requestAction(record, 'deactivate')}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              {t('adminPollenRecords.actions.deactivate')}
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => requestAction(record, 'activate')}
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              {t('adminPollenRecords.actions.activate')}
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => requestAction(record, 'delete')}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('actions.delete')}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <PollenRecordFormDialog
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        record={editorRecord}
      />

      <Dialog
        open={!!pendingAction}
        onOpenChange={open => {
          if (!open && !isPendingAction) {
            setPendingAction(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actionMessage?.title}</DialogTitle>
            <DialogDescription>{actionMessage?.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPendingAction(null)}
              disabled={isPendingAction}
            >
              {t('actions.cancel')}
            </Button>
            <Button
              variant={actionMessage?.destructive ? 'destructive' : 'default'}
              onClick={() => void confirmPendingAction()}
              disabled={isPendingAction}
            >
              {isPendingAction ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {actionMessage?.confirmLabel}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PollenRecordsPage;
