import { addDays, differenceInCalendarDays } from 'date-fns';

export type ArtificialSwarmCheckpointId =
  | 'setup'
  | 'queenCellCheck'
  | 'secondQueenCellCheck'
  | 'colonyReview';

export interface ArtificialSwarmCheckpointTemplate {
  id: ArtificialSwarmCheckpointId;
  dayOffset: number;
  titleKey: string;
  summaryKey: string;
  checklistKeys: string[];
}

export interface ArtificialSwarmCheckpointPlan
  extends ArtificialSwarmCheckpointTemplate {
  date: Date;
}

export type ArtificialSwarmWarningCode =
  | 'lateQueenCellCheck'
  | 'unsafeCheckpointSpacing'
  | 'illogicalScheduleOrder';

export interface ArtificialSwarmWarning {
  code: ArtificialSwarmWarningCode;
  checkpointIds: ArtificialSwarmCheckpointId[];
}

export const ARTIFICIAL_SWARM_CHECKPOINTS: ArtificialSwarmCheckpointTemplate[] = [
  {
    id: 'setup',
    dayOffset: 0,
    titleKey:
      'swarmManagement.artificialSwarm.planner.checkpoints.setup.title',
    summaryKey:
      'swarmManagement.artificialSwarm.planner.checkpoints.setup.summary',
    checklistKeys: [
      'swarmManagement.artificialSwarm.planner.checkpoints.setup.checklist.0',
      'swarmManagement.artificialSwarm.planner.checkpoints.setup.checklist.1',
      'swarmManagement.artificialSwarm.planner.checkpoints.setup.checklist.2',
    ],
  },
  {
    id: 'queenCellCheck',
    dayOffset: 7,
    titleKey:
      'swarmManagement.artificialSwarm.planner.checkpoints.queenCellCheck.title',
    summaryKey:
      'swarmManagement.artificialSwarm.planner.checkpoints.queenCellCheck.summary',
    checklistKeys: [
      'swarmManagement.artificialSwarm.planner.checkpoints.queenCellCheck.checklist.0',
      'swarmManagement.artificialSwarm.planner.checkpoints.queenCellCheck.checklist.1',
      'swarmManagement.artificialSwarm.planner.checkpoints.queenCellCheck.checklist.2',
    ],
  },
  {
    id: 'secondQueenCellCheck',
    dayOffset: 14,
    titleKey:
      'swarmManagement.artificialSwarm.planner.checkpoints.secondQueenCellCheck.title',
    summaryKey:
      'swarmManagement.artificialSwarm.planner.checkpoints.secondQueenCellCheck.summary',
    checklistKeys: [
      'swarmManagement.artificialSwarm.planner.checkpoints.secondQueenCellCheck.checklist.0',
      'swarmManagement.artificialSwarm.planner.checkpoints.secondQueenCellCheck.checklist.1',
      'swarmManagement.artificialSwarm.planner.checkpoints.secondQueenCellCheck.checklist.2',
    ],
  },
  {
    id: 'colonyReview',
    dayOffset: 21,
    titleKey:
      'swarmManagement.artificialSwarm.planner.checkpoints.colonyReview.title',
    summaryKey:
      'swarmManagement.artificialSwarm.planner.checkpoints.colonyReview.summary',
    checklistKeys: [
      'swarmManagement.artificialSwarm.planner.checkpoints.colonyReview.checklist.0',
      'swarmManagement.artificialSwarm.planner.checkpoints.colonyReview.checklist.1',
      'swarmManagement.artificialSwarm.planner.checkpoints.colonyReview.checklist.2',
    ],
  },
];

export const generateArtificialSwarmPlan = (
  startDate: Date,
): ArtificialSwarmCheckpointPlan[] =>
  ARTIFICIAL_SWARM_CHECKPOINTS.map(checkpoint => ({
    ...checkpoint,
    date: addDays(startDate, checkpoint.dayOffset),
  }));

export const getArtificialSwarmWarnings = (
  checkpoints: Array<Pick<ArtificialSwarmCheckpointPlan, 'id' | 'date'>>,
): ArtificialSwarmWarning[] => {
  const warnings: ArtificialSwarmWarning[] = [];

  const setup = checkpoints.find(checkpoint => checkpoint.id === 'setup');
  const queenCellCheck = checkpoints.find(
    checkpoint => checkpoint.id === 'queenCellCheck',
  );

  if (setup && queenCellCheck) {
    const queenCellGap = differenceInCalendarDays(
      queenCellCheck.date,
      setup.date,
    );

    if (queenCellGap > 8) {
      warnings.push({
        code: 'lateQueenCellCheck',
        checkpointIds: ['setup', 'queenCellCheck'],
      });
    }
  }

  for (let index = 1; index < checkpoints.length; index += 1) {
    const previousCheckpoint = checkpoints[index - 1];
    const currentCheckpoint = checkpoints[index];
    const gap = differenceInCalendarDays(
      currentCheckpoint.date,
      previousCheckpoint.date,
    );

    if (gap <= 0) {
      warnings.push({
        code: 'illogicalScheduleOrder',
        checkpointIds: [previousCheckpoint.id, currentCheckpoint.id],
      });
      continue;
    }

    if (gap < 5 || gap > 10) {
      warnings.push({
        code: 'unsafeCheckpointSpacing',
        checkpointIds: [previousCheckpoint.id, currentCheckpoint.id],
      });
    }
  }

  return warnings;
};
