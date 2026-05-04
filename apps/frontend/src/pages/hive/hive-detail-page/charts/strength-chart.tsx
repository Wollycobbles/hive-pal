import { Line, LineChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';
import {
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BaseInspectionChart } from './base-inspection-chart';
import { ChartPeriod } from './index';
import { InspectionResponse } from 'shared-schemas';

interface StrengthChartProps {
  hiveId: string | undefined;
  period: ChartPeriod;
}

function hasStrengthData(inspection: InspectionResponse): boolean {
  return inspection.observations?.strength != null;
}

export const StrengthChart: React.FC<StrengthChartProps> = ({
  hiveId,
  period,
}) => {
  const { t } = useTranslation(['hive', 'common']);
  
  return (
    <BaseInspectionChart
      hiveId={hiveId}
      period={period}
      title={t('hive:charts.colonyStrength')}
      description={t('hive:charts.strengthDescription')}
      config={{
        strength: { label: 'Strength', color: '#6366f1' },
      }}
      dataTransformer={inspection => ({
        date: format(parseISO(inspection.date), 'MMM dd'),
        strength: inspection.observations?.strength ?? null,
      })}
      filterFn={hasStrengthData}
    >
      {(chartData) => (
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="strength"
            stroke="var(--color-strength)"
            strokeWidth={2}
            connectNulls
            dot={{ r: 3 }}
          />
        </LineChart>
      )}
    </BaseInspectionChart>
  );
};
