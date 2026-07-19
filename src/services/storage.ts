import type { ProgressMap, StudySessionRecord, UserSettings } from '../types'

export const STORAGE_KEYS = {
  settings: 'smartphone-learning:v1:settings',
  progress: 'smartphone-learning:v1:progress',
  sessions: 'smartphone-learning:v1:sessions',
} as const

export const DEFAULT_SETTINGS: UserSettings = {
  fontScale: 1,
  speechEnabled: true,
}

export const DEFAULT_PROGRESS: ProgressMap = {
  registration: { unlocked: true, completed: false },
  captcha: { unlocked: false, completed: false },
  ordering: { unlocked: false, completed: false },
}

interface StoredValue<T> {
  schemaVersion: 1
  data: T
}

function readStored<T>(key: string, validate: (value: unknown) => value is T): T | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredValue<unknown>>
    return parsed.schemaVersion === 1 && validate(parsed.data) ? parsed.data : null
  } catch {
    return null
  }
}

function writeStored<T>(key: string, data: T): void {
  try {
    const value: StoredValue<T> = { schemaVersion: 1, data }
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Keep the current in-memory state when private browsing or storage limits block writes.
  }
}

function isSettings(value: unknown): value is UserSettings {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<UserSettings>
  return [1, 1.15, 1.3].includes(item.fontScale as number) && typeof item.speechEnabled === 'boolean'
}

function isProgress(value: unknown): value is ProgressMap {
  if (!value || typeof value !== 'object') return false
  const item = value as Partial<ProgressMap>
  return (['registration', 'captcha', 'ordering'] as const).every((id) => {
    const progress = item[id]
    return progress && typeof progress.completed === 'boolean' && typeof progress.unlocked === 'boolean'
  })
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
}

function isConfidenceScore(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5
}

function isTimestamp(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && !Number.isNaN(Date.parse(value))
}

function isSessions(value: unknown): value is StudySessionRecord[] {
  return Array.isArray(value) && value.every((item) => {
    if (!item || typeof item !== 'object') return false
    const session = item as Partial<StudySessionRecord>
    const isCompleted = typeof session.completed === 'boolean' && session.completed
    return (
      session.schemaVersion === 1 &&
      typeof session.sessionId === 'string' && session.sessionId.length > 0 &&
      typeof session.participantCode === 'string' && /^P0[1-5]$/.test(session.participantCode) &&
      ['registration', 'captcha', 'ordering'].includes(session.levelId ?? '') &&
      isNonNegativeInteger(session.errorCount) &&
      isNonNegativeInteger(session.hintCount) &&
      isNonNegativeInteger(session.durationSeconds) &&
      typeof session.attemptNo === 'number' && Number.isInteger(session.attemptNo) && session.attemptNo >= 1 &&
      isConfidenceScore(session.confidenceBefore) &&
      typeof session.completed === 'boolean' &&
      (isCompleted ? isTimestamp(session.startedAt) : session.startedAt === '' || isTimestamp(session.startedAt)) &&
      (isCompleted ? isTimestamp(session.completedAt) : session.completedAt === undefined) &&
      (isCompleted ? isConfidenceScore(session.confidenceAfter) : session.confidenceAfter === undefined)
    )
  })
}

export function loadSettings(): UserSettings {
  return readStored(STORAGE_KEYS.settings, isSettings) ?? { ...DEFAULT_SETTINGS }
}

export function saveSettings(settings: UserSettings): void {
  writeStored(STORAGE_KEYS.settings, settings)
}

export function loadProgress(): ProgressMap {
  const stored = readStored(STORAGE_KEYS.progress, isProgress)
  if (!stored) return structuredClone(DEFAULT_PROGRESS)

  if (stored.registration.completed && !stored.captcha.unlocked) {
    return { ...stored, captcha: { ...stored.captcha, unlocked: true } }
  }
  return stored
}

export function saveProgress(progress: ProgressMap): void {
  writeStored(STORAGE_KEYS.progress, progress)
}

export function loadSessions(): StudySessionRecord[] {
  return readStored(STORAGE_KEYS.sessions, isSessions) ?? []
}

export function saveSessions(sessions: StudySessionRecord[]): void {
  writeStored(STORAGE_KEYS.sessions, sessions)
}

export function clearStudySessions(): void {
  localStorage.removeItem(STORAGE_KEYS.sessions)
}
