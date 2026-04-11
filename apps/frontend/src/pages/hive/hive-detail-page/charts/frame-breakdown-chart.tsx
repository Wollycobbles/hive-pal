import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { format, parseISO } from 'date-fns';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartPeriod } from './index';
import { useInspectionChartData } from './useChartData';
import { InspectionResponse } from 'shared-schemas';

interface FrameBreakdownChartProps {
  hiveId: string | undefined;
  period: ChartPeriod;
}

function toPercent(
  count: number | null | undefined,
  total: number | null | undefined,
): number {
  if (count == null || total == null || total === 0) return 0;
  return Math.round((count / total) * 100);
}

function hasFrameData(inspection: InspectionResponse): boolean {
  const obs = inspection.observations;
  return (
    obs != null &&
    obs.totalFrames != null &&
    obs.totalFrames > 0 &&
    (obs.eggsFrames != null ||
      obs.uncappedBroodFrames != null ||
      obs.cappedBroodFrames != null ||
      obs.pollenFrames != null ||
      obs.honeyFrames != null)
  );
}

export const FrameBreakdownChart: React.FC<FrameBreakdownChartProps> = ({
  hiveId,
  period,
}) => {
  const chartData = useInspectionChartData(
    hiveId,
    period,
    inspection => {
      const obs = inspection.observations;
      const total = obs?.totalFrames ?? null;
      return {
        date: format(parseISO(inspection.date), 'MMM dd'),
        eggs: toPercent(obs?.eggsFrames, total),
        uncappedBrood: toPercent(obs?.uncappedBroodFrames, total),
        cappedBrood: toPercent(obs?.cappedBroodFrames, total),
        pollen: toPercent(obs?.pollenFrames, total),
        honey: toPercent(obs?.honeyFrames, total),
      };
    },
    hasFrameData,
  );

  if (!hiveId || chartData.length === 0) {
    return null;
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Frame Breakdown</CardTitle>
        <CardDescription>
          Percentage of frames by content over the season
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            eggs: { label: 'Eggs', color: '#facc15' },
            uncappedBrood: { label: 'Uncapped Brood', color: '#fb923c' },
            cappedBrood: { label: 'Capped Brood', color: '#b45309' },
            pollen: { label: 'Pollen', color: '#22c55e' },
            honey: { label: 'Honey', color: '#eab308' },
          }}
        >
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 100]} unit="%" />
            <ChartTooltip
              content={<ChartTooltipContent formatter={v => `${v}%`} />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            <Area
              type="monotone"
              dataKey="honey"
              stackId="1"
              stroke="var(--color-honey)"
              fill="var(--color-honey)"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="pollen"
              stackId="1"
              stroke="var(--color-pollen)"
              fill="var(--color-pollen)"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="cappedBrood"
              stackId="1"
              stroke="var(--color-cappedBrood)"
              fill="var(--color-cappedBrood)"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="uncappedBrood"
              stackId="1"
              stroke="var(--color-uncappedBrood)"
              fill="var(--color-uncappedBrood)"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="eggs"
              stackId="1"
              stroke="var(--color-eggs)"
              fill="var(--color-eggs)"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
