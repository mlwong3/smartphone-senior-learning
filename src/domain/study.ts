import type {
  ActiveStudyContext,
  LessonMetrics,
  LevelId,
  StudySessionRecord,
} from '../types'

interface PairValue {
  first: number
  second: number
}

export interface StudySummary {
  pairCount: number
  duration: PairValue
  errors: PairValue
  hints: PairValue
  confidence: PairValue
}

function average(values: number[]): number {
  if (!values.length) return 0
  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1))
}

export function getNextAttemptNo(
  sessions: StudySessionRecord[],
  participantCode: string,
  levelId: LevelId,
): number {
  return (
    sessions.filter(
      (session) =>
        session.completed &&
        session.participantCode === participantCode &&
        session.levelId === levelId,
    ).length + 1
  )
}

export function summarizePairedSessions(
  sessions: StudySessionRecord[],
  levelId: LevelId,
): StudySummary {
  const participants = [...new Set(sessions.map((session) => session.participantCode))]
  const pairs = participants.flatMap((participantCode) => {
    const completed = sessions
      .filter(
        (session) =>
          session.completed &&
          session.levelId === levelId &&
          session.participantCode === participantCode,
      )
      .sort((a, b) => a.attemptNo - b.attemptNo)
    const first = completed.find((session) => session.attemptNo === 1)
    const second = completed.find((session) => session.attemptNo === 2)
    return first && second ? [{ first, second }] : []
  })

  return {
    pairCount: pairs.length,
    duration: {
      first: average(pairs.map(({ first }) => first.durationSeconds)),
      second: average(pairs.map(({ second }) => second.durationSeconds)),
    },
    errors: {
      first: average(pairs.map(({ first }) => first.errorCount)),
      second: average(pairs.map(({ second }) => second.errorCount)),
    },
    hints: {
      first: average(pairs.map(({ first }) => first.hintCount)),
      second: average(pairs.map(({ second }) => second.hintCount)),
    },
    confidence: {
      first: average(pairs.map(({ first }) => first.confidenceBefore)),
      second: average(pairs.map(({ second }) => second.confidenceAfter ?? second.confidenceBefore)),
    },
  }
}

const CSV_COLUMNS: (keyof StudySessionRecord)[] = [
  'participantCode',
  'sessionId',
  'levelId',
  'attemptNo',
  'startedAt',
  'completedAt',
  'durationSeconds',
  'errorCount',
  'hintCount',
  'confidenceBefore',
  'confidenceAfter',
  'completed',
]

const CSV_HEADERS = [
  'participant_code',
  'session_id',
  'level_id',
  'attempt_no',
  'started_at',
  'completed_at',
  'duration_seconds',
  'error_count',
  'hint_count',
  'confidence_before',
  'confidence_after',
  'completed',
]

function csvValue(value: unknown): string {
  const text = value === undefined ? '' : String(value)
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function buildStudyCsv(sessions: StudySessionRecord[]): string {
  const rows = sessions.map((session) =>
    CSV_COLUMNS.map((column) => csvValue(session[column])).join(','),
  )
  return `\uFEFF${[CSV_HEADERS.join(','), ...rows].join('\r\n')}`
}

export function createStudySession(
  context: ActiveStudyContext,
  metrics: LessonMetrics,
  confidenceAfter?: number,
): StudySessionRecord {
  const sessionId =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `session-${Date.now()}-${Math.random().toString(16).slice(2)}`
  return {
    schemaVersion: 1,
    sessionId,
    participantCode: context.participantCode,
    levelId: context.levelId,
    attemptNo: context.attemptNo,
    confidenceBefore: context.confidenceBefore,
    confidenceAfter,
    ...metrics,
  }
}
