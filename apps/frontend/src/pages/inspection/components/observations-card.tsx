import { ClipboardList } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ObservationNumberRatingView } from './observation-number-rating-view';
import { useTranslation } from 'react-i18next';

type ObservationsCardProps = {
  observations?: {
    strength?: number | null;
    uncappedBrood?: number | null;
    cappedBrood?: number | null;
    honeyStores?: number | null;
    pollenStores?: number | null;
    queenCells?: number | null;
    broodPattern?: string | null;
    additionalObservations?: string[];
    reminderObservations?: string[];
    totalFrames?: number | null;
    eggsFrames?: number | null;
    uncappedBroodFrames?: number | null;
    cappedBroodFrames?: number | null;
    pollenFrames?: number | null;
    honeyFrames?: number | null;
  };
};

type FrameCountBarProps = {
  label: string;
  count: number | null | undefined;
  total: number;
  color: string;
};

const FrameCountBar = ({ label, count, total, color }: FrameCountBarProps) => {
  if (count == null) return null;
  const pct = Math.round((count / total) * 100);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {count} / {total} ({pct}%)
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
};

export const ObservationsCard = ({
  observations = {},
}: ObservationsCardProps) => {
  const { t } = useTranslation('inspection');
  const hasFrameCounts =
    observations.totalFrames != null &&
    observations.totalFrames > 0 &&
    (observations.eggsFrames != null ||
      observations.uncappedBroodFrames != null ||
      observations.cappedBroodFrames != null ||
      observations.pollenFrames != null ||
      observations.honeyFrames != null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            {t('inspection:observationsCard.title')}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Frame Count Section */}
          {hasFrameCounts && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('inspection:observations.frameCounts.title')}
                <span className="ml-2 text-muted-foreground font-normal">
                  ({t('inspection:observations.frameCounts.totalFrames', { count: observations.totalFrames })})
                </span>
              </h4>
              <div className="space-y-2">
                <FrameCountBar
                  label={t('inspection:observations.eggsFrames')}
                  count={observations.eggsFrames}
                  total={observations.totalFrames!}
                  color="bg-yellow-400"
                />
                <FrameCountBar
                  label={t('inspection:observations.uncappedBroodFrames')}
                  count={observations.uncappedBroodFrames}
                  total={observations.totalFrames!}
                  color="bg-orange-400"
                />
                <FrameCountBar
                  label={t('inspection:observations.cappedBroodFrames')}
                  count={observations.cappedBroodFrames}
                  total={observations.totalFrames!}
                  color="bg-amber-600"
                />
                <FrameCountBar
                  label={t('inspection:observations.pollenFrames')}
                  count={observations.pollenFrames}
                  total={observations.totalFrames!}
                  color="bg-green-500"
                />
                <FrameCountBar
                  label={t('inspection:observations.honeyFrames')}
                  count={observations.honeyFrames}
                  total={observations.totalFrames!}
                  color="bg-yellow-500"
                />
              </div>
            </div>
          )}

          {/* Numeric Observations */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <ObservationNumberRatingView
              rating={observations.strength}
              label={t('inspection:observationsCard.strength')}
            />
            <ObservationNumberRatingView
              rating={observations.uncappedBrood}
              label={t('inspection:observationsCard.uncappedBrood')}
            />
            <ObservationNumberRatingView
              rating={observations.cappedBrood}
              label={t('inspection:observationsCard.cappedBrood')}
            />
            <ObservationNumberRatingView
              rating={observations.honeyStores}
              label={t('inspection:observationsCard.honeyStores')}
            />
            <ObservationNumberRatingView
              rating={observations.pollenStores}
              label={t('inspection:observationsCard.pollenStores')}
            />
            <ObservationNumberRatingView
              rating={observations.queenCells}
              label={t('inspection:observationsCard.queenCells')}
            />
          </div>

          {/* Brood Pattern */}
          {observations.broodPattern && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('inspection:observationsCard.broodPattern')}
              </h4>
              <Badge variant="outline" className="capitalize">
                {observations.broodPattern.replace('_', ' ')}
              </Badge>
            </div>
          )}

          {/* Additional Observations (Badges/Tags) */}
          {observations.additionalObservations &&
            observations.additionalObservations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('inspection:observationsCard.additionalObservations')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {observations.additionalObservations.map(
                    (observation, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="capitalize"
                      >
                        {observation.replace('_', ' ')}
                      </Badge>
                    ),
                  )}
                </div>
              </div>
            )}

          {/* Reminder Observations */}
          {observations.reminderObservations &&
            observations.reminderObservations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('inspection:observationsCard.reminders')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {observations.reminderObservations.map(
                    (observation, index) => (
                      <Badge
                        key={index}
                        variant="destructive"
                        className="capitalize"
                      >
                        {observation.replace('_', ' ')}
                      </Badge>
                    ),
                  )}
                </div>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
};
