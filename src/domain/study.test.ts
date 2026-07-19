import { describe, expect, it } from 'vitest'
import type { StudySessionRecord } from '../types'
import {
  buildStudyCsv,
  getNextAttemptNo,
  summarizePairedSessions,
} from './study'

function session(
  participantCode: string,
  attemptNo: number,
  overrides: Partial<StudySessionRecord> = {},
): StudySessionRecord {
  return {
    schemaVersion: 1,
    sessionId: `${participantCode}-${attemptNo}`,
    participantCode,
    levelId: 'registration',
    attemptNo,
    startedAt: '2026-07-19T10:00:00.000Z',
    completedAt: '2026-07-19T10:01:00.000Z',
    durationSeconds: attemptNo === 1 ? 60 : 40,
    errorCount: attemptNo === 1 ? 3 : 1,
    hintCount: attemptNo === 1 ? 2 : 0,
    confidenceBefore: attemptNo === 1 ? 2 : 3,
    confidenceAfter: attemptNo === 1 ? 3 : 4,
    completed: true,
    ...overrides,
  }
}

describe('study session analysis', () => {
  it('ignores abandoned records when choosing the next formal attempt', () => {
    const records = [session('P01', 1, { completed: false }), session('P01', 1)]
    expect(getNextAttemptNo(records, 'P01', 'registration')).toBe(2)
  })

  it('summarizes only participants with two completed attempts', () => {
    const records = [
      session('P01', 1),
      session('P01', 2),
      session('P02', 1, { durationSeconds: 80 }),
      session('P02', 2, { durationSeconds: 60 }),
      session('P03', 1),
    ]

    expect(summarizePairedSessions(records, 'registration')).toEqual({
      pairCount: 2,
      duration: { first: 70, second: 50 },
      errors: { first: 3, second: 1 },
      hints: { first: 2, second: 0 },
      confidence: { first: 2, second: 4 },
    })
  })

  it('exports UTF-8 CSV with the fixed column order', () => {
    const csv = buildStudyCsv([session('P01', 1)])
    expect(csv.startsWith('\uFEFFparticipant_code,session_id,level_id,attempt_no')).toBe(true)
    expect(csv).toContain('P01,P01-1,registration,1')
  })
})
