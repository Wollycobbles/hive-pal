import React from 'react';
import { FieldPath, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Minus, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { InspectionFormData } from './schema';

type FrameCounterProps<T> = {
  name: T;
  label: string;
  color: string;
  totalFrames: number | null | undefined;
};

const FrameCounter = <TName extends FieldPath<InspectionFormData>>({
  name,
  label,
  color,
  totalFrames,
}: FrameCounterProps<TName>) => {
  const { control } = useFormContext<InspectionFormData>();
  const hasTotalFrames = totalFrames != null && totalFrames > 0;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const currentValue = field.value as number | null | undefined;
        const maxValue = hasTotalFrames ? totalFrames : 999;
        const pct =
          hasTotalFrames && currentValue != null
            ? Math.round((currentValue / totalFrames!) * 100)
            : null;

        const decrement = (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          const next = Math.max(0, (currentValue ?? 0) - 1);
          field.onChange(next);
        };

        const increment = (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          const next = Math.min(maxValue!, (currentValue ?? 0) + 1);
          field.onChange(next);
        };

        const clear = (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          field.onChange(undefined);
        };

        return (
          <FormItem>
            <div className="flex flex-col gap-1.5 p-3 rounded-xl border bg-card">
              {/* Label row */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{label}</span>
                {currentValue != null && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={clear}
                    aria-label="Clear"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Counter row */}
              <div className="flex items-center gap-3">
                {/* Minus button */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-xl shrink-0 text-lg"
                  onClick={decrement}
                  disabled={currentValue == null || currentValue <= 0}
                  aria-label={`Decrease ${label}`}
                >
                  <Minus className="h-5 w-5" />
                </Button>

                {/* Count display */}
                <div className="flex-1 flex flex-col items-center gap-0.5">
                  <span className="text-3xl font-bold tabular-nums leading-none">
                    {currentValue ?? '—'}
                  </span>
                  {hasTotalFrames && (
                    <span className="text-xs text-muted-foreground">
                      {currentValue != null
                        ? `/ ${totalFrames} frames${pct != null ? ` (${pct}%)` : ''}`
                        : `of ${totalFrames} frames`}
                    </span>
                  )}
                </div>

                {/* Plus button */}
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 rounded-xl shrink-0 text-lg"
                  onClick={increment}
                  disabled={
                    hasTotalFrames ? currentValue === maxValue : false
                  }
                  aria-label={`Increase ${label}`}
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>

              {/* Progress bar */}
              {hasTotalFrames && currentValue != null && totalFrames != null && (
                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-200 ${color}`}
                    style={{
                      width: `${Math.min(100, (currentValue / totalFrames) * 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

type FrameCountSectionProps = {
  totalFrames?: number | null;
};

export const FrameCountSection: React.FC<FrameCountSectionProps> = ({
  totalFrames,
}) => {
  const { t } = useTranslation('inspection');
  const { control } = useFormContext<InspectionFormData>();

  const frameTotalField = useWatch({
    name: 'observations.totalFrames',
    control,
  });

  const effectiveTotalFrames = frameTotalField ?? totalFrames ?? null;

  const frameTypes: {
    name: FieldPath<InspectionFormData>;
    labelKey: string;
    color: string;
  }[] = [
    {
      name: 'observations.eggsFrames',
      labelKey: 'observations.eggsFrames',
      color: 'bg-yellow-400',
    },
    {
      name: 'observations.uncappedBroodFrames',
      labelKey: 'observations.uncappedBroodFrames',
      color: 'bg-orange-400',
    },
    {
      name: 'observations.cappedBroodFrames',
      labelKey: 'observations.cappedBroodFrames',
      color: 'bg-amber-600',
    },
    {
      name: 'observations.pollenFrames',
      labelKey: 'observations.pollenFrames',
      color: 'bg-green-500',
    },
    {
      name: 'observations.honeyFrames',
      labelKey: 'observations.honeyFrames',
      color: 'bg-yellow-500',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">
          {t('observations.frameCounts.title')}
        </h3>
        {effectiveTotalFrames != null && (
          <span className="text-sm text-muted-foreground">
            {t('observations.frameCounts.totalFrames', {
              count: effectiveTotalFrames,
            })}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {frameTypes.map(({ name, labelKey, color }) => (
          <FrameCounter
            key={name}
            name={name}
            label={t(labelKey)}
            color={color}
            totalFrames={effectiveTotalFrames}
          />
        ))}
      </div>
    </div>
  );
};
