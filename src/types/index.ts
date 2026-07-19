export type LevelId = 'registration' | 'captcha' | 'ordering'
export type ScreenId = 'home' | LevelId | 'study'
export type LessonPhase = 'demo' | 'guided' | 'independent' | 'review'
export type FontScale = 1 | 1.15 | 1.3

export interface LevelDefinition {
  id: LevelId
  order: number
  title: string
  description: string
  available: boolean
}

export interface LevelProgress {
  unlocked: boolean
  completed: boolean
}

export type ProgressMap = Record<LevelId, LevelProgress>

export interface LessonMetrics {
  errorCount: number
  hintCount: number
  startedAt: string
  completedAt?: string
  durationSeconds: number
  completed: boolean
}

export interface StudySessionRecord extends LessonMetrics {
  schemaVersion: 1
  sessionId: string
  participantCode: string
  levelId: LevelId
  attemptNo: number
  confidenceBefore: number
  confidenceAfter?: number
}

export interface UserSettings {
  fontScale: FontScale
  speechEnabled: boolean
}

export interface ActiveStudyContext {
  participantCode: string
  levelId: LevelId
  confidenceBefore: number
  attemptNo: number
}
