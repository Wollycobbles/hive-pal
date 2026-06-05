import { useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import {
  pollenColorGroupSchema,
  pollenRegionSchema,
  pollenSeasonSchema,
  pollenReferenceCreateSchema,
  type PollenReferenceAdminListItem,
  type PollenReferenceCreate,
  type PollenRegion,
  type PollenSeason,
} from 'shared-schemas';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateAdminPollenReference, useUpdateAdminPollenReference } from '@/api/hooks/useAdminPollenReferences';
import { getSeasonLabel } from '@/utils/pollen-utils';

type RegionMappingFormValue = {
  region: PollenRegion;
  seasons: PollenSeason[];
  notes: string;
};

type PollenRecordFormValues = {
  plantName: string;
  scientificName: string;
  colorLabel: string;
  colorGroup: PollenReferenceCreate['colorGroup'];
  hexColor: string;
  notes: string;
  active: boolean;
  regions: RegionMappingFormValue[];
};

const REGION_OPTIONS = pollenRegionSchema.options;
const COLOR_GROUP_OPTIONS = pollenColorGroupSchema.options;
const SEASON_OPTIONS = pollenSeasonSchema.options;

const createRegionMapping = (
  region: PollenRegion = 'UK_AND_IRELAND',
): RegionMappingFormValue => ({
  region,
  seasons: ['spring'],
  notes: '',
});

const toFormValues = (
  record: PollenReferenceAdminListItem | null,
): PollenRecordFormValues => {
  if (!record) {
    return {
      plantName: '',
      scientificName: '',
      colorLabel: '',
      colorGroup: 'yellow',
      hexColor: '#facc15',
      notes: '',
      active: true,
      regions: [createRegionMapping()],
    };
  }

  return {
    plantName: record.plantName,
    scientificName: record.scientificName ?? '',
    colorLabel: record.colorLabel,
    colorGroup: record.colorGroup,
    hexColor: record.hexColor,
    notes: record.notes ?? '',
    active: record.active,
    regions: record.regions.length
      ? record.regions.map(region => ({
          region: region.region,
          seasons: [...region.seasons],
          notes: region.notes ?? '',
        }))
      : [createRegionMapping()],
  };
};

const toNullableText = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

type PollenRecordFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: PollenReferenceAdminListItem | null;
};

export function PollenRecordFormDialog({
  open,
  onOpenChange,
  record,
}: PollenRecordFormDialogProps) {
  const { t } = useTranslation('common');
  const isEditMode = !!record;
  const createMutation = useCreateAdminPollenReference();
  const updateMutation = useUpdateAdminPollenReference();

  const form = useForm<PollenRecordFormValues>({
    resolver: zodResolver(pollenReferenceCreateSchema),
    defaultValues: toFormValues(null),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'regions',
  });

  useEffect(() => {
    if (open) {
      form.reset(toFormValues(record));
    }
  }, [form, open, record]);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const submit = async (values: PollenRecordFormValues) => {
    const payload = {
      plantName: values.plantName.trim(),
      scientificName: toNullableText(values.scientificName),
      colorLabel: values.colorLabel.trim(),
      colorGroup: values.colorGroup,
      hexColor: values.hexColor.trim(),
      notes: toNullableText(values.notes),
      active: values.active,
      regions: values.regions.map(region => ({
        region: region.region,
        seasons: region.seasons,
        notes: toNullableText(region.notes),
      })),
    };

    if (record) {
      await updateMutation.mutateAsync({
        id: record.id,
        ...payload,
      });
    } else {
      await createMutation.mutateAsync(payload);
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? t('adminPollenRecords.form.editTitle')
              : t('adminPollenRecords.form.createTitle')}
          </DialogTitle>
          <DialogDescription>
            {t('adminPollenRecords.form.description')}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="plantName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('adminPollenRecords.fields.plantName')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scientificName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('adminPollenRecords.fields.scientificName')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="colorLabel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('adminPollenRecords.fields.colorLabel')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="colorGroup"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('adminPollenRecords.fields.colorGroup')}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {COLOR_GROUP_OPTIONS.map(option => (
                          <SelectItem key={option} value={option}>
                            {t(`pollenIdentification.colorGroups.${option}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hexColor"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t('adminPollenRecords.fields.hexColor')}</FormLabel>
                    <div className="flex items-center gap-3">
                      <div
                        aria-hidden="true"
                        className="h-10 w-10 rounded-md border"
                        style={{ backgroundColor: field.value || '#ffffff' }}
                      />
                      <Input
                        type="color"
                        aria-label={t('adminPollenRecords.fields.hexColorPicker', {
                          defaultValue: 'Colour picker',
                        })}
                        value={field.value || '#ffffff'}
                        onChange={event => field.onChange(event.target.value)}
                        onBlur={field.onBlur}
                        className="h-10 w-14 shrink-0 p-1"
                      />
                      <FormControl>
                        <Input {...field} placeholder="#facc15" className="max-w-xs" />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t('adminPollenRecords.fields.notes')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="md:col-span-2 flex items-center gap-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={checked => field.onChange(Boolean(checked))}
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="text-base">
                        {t('adminPollenRecords.fields.active')}
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        {t('adminPollenRecords.fields.activeDescription')}
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4 rounded-lg border p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium">
                    {t('adminPollenRecords.fields.regions')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {t('adminPollenRecords.form.regionsDescription')}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append(createRegionMapping())}
                >
                  {t('actions.add')} {t('adminPollenRecords.fields.region')}
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((regionField, index) => {
                  const selectedSeasons = form.watch(
                    `regions.${index}.seasons` as const,
                  );

                  return (
                    <div key={regionField.id} className="space-y-4 rounded-md border p-4">
                      <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
                        <FormField
                          control={form.control}
                          name={`regions.${index}.region` as const}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {t('adminPollenRecords.fields.region')}
                              </FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {REGION_OPTIONS.map(option => (
                                    <SelectItem key={option} value={option}>
                                      {t(`pollenIdentification.scope.${option}`)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button
                          type="button"
                          variant="ghost"
                          className="justify-self-start text-destructive"
                          disabled={fields.length === 1}
                          onClick={() => remove(index)}
                        >
                          {t('actions.remove')}
                        </Button>
                      </div>

                      <FormField
                        control={form.control}
                        name={`regions.${index}.seasons` as const}
                        render={() => (
                          <FormItem>
                            <FormLabel>{t('adminPollenRecords.fields.seasons')}</FormLabel>
                            <FormControl>
                              <div className="flex flex-wrap gap-3">
                                {SEASON_OPTIONS.map(season => {
                                  const checked = Boolean(selectedSeasons?.includes(season));

                                  return (
                                    <label
                                      key={season}
                                      className="flex items-center gap-2 rounded-md border px-3 py-2"
                                    >
                                      <Checkbox
                                        checked={checked}
                                        onCheckedChange={next => {
                                          const current = selectedSeasons ?? [];
                                          const nextValues = next
                                            ? [...current, season]
                                            : current.filter(item => item !== season);

                                          form.setValue(
                                            `regions.${index}.seasons` as const,
                                            nextValues,
                                            {
                                              shouldDirty: true,
                                              shouldTouch: true,
                                              shouldValidate: true,
                                            },
                                          );
                                        }}
                                      />
                                      <span className="text-sm">
                                        {getSeasonLabel(season, (key, fallback) =>
                                          t(key, { defaultValue: fallback }),
                                        )}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`regions.${index}.notes` as const}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              {t('adminPollenRecords.fields.regionNotes')}
                            </FormLabel>
                            <FormControl>
                              <Textarea {...field} rows={2} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {t('actions.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isEditMode ? t('actions.save') : t('actions.create')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
