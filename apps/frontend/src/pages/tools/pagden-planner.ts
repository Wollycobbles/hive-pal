import { addDays, differenceInCalendarDays } from 'date-fns';

export type PagdenCheckpointId =
  | 'setup'
  | 'queenCellCheck'
  | 'secondQueenCellCheck'
  | 'colonyReview';

export interface PagdenCheckpointTemplate {
  id: PagdenCheckpointId;
  dayOffset: number;
  titleKey: string;
  summaryKey: string;
  checklistKeys: string[];
}

export interface PagdenCheckpointPlan extends PagdenCheckpointTemplate {
  date: Date;
}

export type PagdenWarningCode =
  | 'lateQueenCellCheck'
  | 'unsafeCheckpointSpacing'
  | 'illogicalScheduleOrder';

export interface PagdenWarning {
  code: PagdenWarningCode;
  checkpointIds: PagdenCheckpointId[];
}

export const PAGDEN_CHECKPOINTS: PagdenCheckpointTemplate[] = [
  {
    id: 'setup',
    dayOffset: 0,
    titleKey: 'swarmManagement.pagden.planner.checkpoints.setup.title',
    summaryKey: 'swarmManagement.pagden.planner.checkpoints.setup.summary',
    checklistKeys: [
      'swarmManagement.pagden.planner.checkpoints.setup.checklist.0',
      'swarmManagement.pagden.planner.checkpoints.setup.checklist.1',
      'swarmManagement.pagden.planner.checkpoints.setup.checklist.2',
    ],
  },
  {
    id: 'queenCellCheck',
    dayOffset: 7,
    titleKey: 'swarmManagement.pagden.planner.checkpoints.queenCellCheck.title',
    summaryKey:
      'swarmManagement.pagden.planner.checkpoints.queenCellCheck.summary',
    checklistKeys: [
      'swarmManagement.pagden.planner.checkpoints.queenCellCheck.checklist.0',
      'swarmManagement.pagden.planner.checkpoints.queenCellCheck.checklist.1',
      'swarmManagement.pagden.planner.checkpoints.queenCellCheck.checklist.2',
    ],
  },
  {
    id: 'secondQueenCellCheck',
    dayOffset: 14,
    titleKey:
      'swarmManagement.pagden.planner.checkpoints.secondQueenCellCheck.title',
    summaryKey:
      'swarmManagement.pagden.planner.checkpoints.secondQueenCellCheck.summary',
    checklistKeys: [
      'swarmManagement.pagden.planner.checkpoints.secondQueenCellCheck.checklist.0',
      'swarmManagement.pagden.planner.checkpoints.secondQueenCellCheck.checklist.1',
      'swarmManagement.pagden.planner.checkpoints.secondQueenCellCheck.checklist.2',
    ],
  },
  {
    id: 'colonyReview',
    dayOffset: 21,
    titleKey: 'swarmManagement.pagden.planner.checkpoints.colonyReview.title',
    summaryKey:
      'swarmManagement.pagden.planner.checkpoints.colonyReview.summary',
    checklistKeys: [
      'swarmManagement.pagden.planner.checkpoints.colonyReview.checklist.0',
      'swarmManagement.pagden.planner.checkpoints.colonyReview.checklist.1',
      'swarmManagement.pagden.planner.checkpoints.colonyReview.checklist.2',
    ],
  },
];

export const generatePagdenPlan = (startDate: Date): PagdenCheckpointPlan[] =>
  PAGDEN_CHECKPOINTS.map(checkpoint => ({
    ...checkpoint,
    date: addDays(startDate, checkpoint.dayOffset),
  }));

export const getPagdenWarnings = (
  checkpoints: Array<Pick<PagdenCheckpointPlan, 'id' | 'date'>>,
): PagdenWarning[] => {
  const warnings: PagdenWarning[] = [];

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
