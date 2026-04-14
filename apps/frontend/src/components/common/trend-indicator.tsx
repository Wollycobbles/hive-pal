import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendIndicatorProps {
  delta: number | null;
  unit?: string;
  /** Size class applied to the icon, e.g. "h-3 w-3" */
  iconSize?: string;
  /** Whether to render the numeric delta alongside the icon */
  showDelta?: boolean;
}

/**
 * Renders a trend icon (up/down/flat) with an optional delta value.
 * Used wherever an observation is compared across two inspections.
 */
export const TrendIndicator: React.FC<TrendIndicatorProps> = ({
  delta,
  unit = '',
  iconSize = 'h-3 w-3',
  showDelta = true,
}) => {
  const isUp   = delta != null && delta > 0;
  const isDown = delta != null && delta < 0;
  const Icon   = isUp ? TrendingUp : isDown ? TrendingDown : Minus;

  const deltaStr =
    delta != null && delta !== 0
      ? isUp
        ? `+${delta}${unit}`
        : `${delta}${unit}`
      : null;

  return (
    <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
      <Icon className={iconSize} />
      {showDelta && deltaStr && (
        <span className="tabular-nums">{deltaStr}</span>
      )}
    </span>
  );
};
