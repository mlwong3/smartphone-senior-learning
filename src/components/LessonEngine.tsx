import { useRef, useState, type ReactNode } from 'react'
import type { LessonMetrics, LessonPhase } from '../types'

export interface LessonController {
  phase: LessonPhase
  metrics: LessonMetrics
  isReplay: boolean
  finishDemo: () => void
  beginIndependent: () => void
  recordError: () => void
  recordHint: () => void
  replayDemo: () => void
  complete: () => LessonMetrics
  abandon: () => LessonMetrics
}

interface LessonEngineProps {
  children: (controller: LessonController) => ReactNode
  onComplete: (metrics: LessonMetrics) => void
}

function elapsedSeconds(startedAtMs: number | null): number {
  return startedAtMs === null ? 0 : Math.max(1, Math.ceil((Date.now() - startedAtMs) / 1000))
}

export function LessonEngine({ children, onComplete }: LessonEngineProps) {
  const [phase, setPhase] = useState<LessonPhase>('demo')
  const [metrics, setMetrics] = useState<LessonMetrics>({
    errorCount: 0,
    hintCount: 0,
    startedAt: '',
    durationSeconds: 0,
    completed: false,
  })
  const [replayFrom, setReplayFrom] = useState<LessonPhase | null>(null)
  const startedAtMs = useRef<number | null>(null)

  function finishDemo() {
    if (replayFrom) {
      setPhase(replayFrom)
      setReplayFrom(null)
      return
    }
    setPhase('guided')
  }

  function beginIndependent() {
    const now = Date.now()
    startedAtMs.current = now
    setMetrics((current) => ({ ...current, startedAt: new Date(now).toISOString() }))
    setPhase('independent')
  }

  function recordError() {
    setMetrics((current) => ({ ...current, errorCount: current.errorCount + 1 }))
  }

  function recordHint() {
    setMetrics((current) => ({ ...current, hintCount: current.hintCount + 1 }))
  }

  function replayDemo() {
    recordHint()
    setReplayFrom(phase)
    setPhase('demo')
  }

  function finish(completed: boolean): LessonMetrics {
    const result: LessonMetrics = {
      ...metrics,
      completed,
      completedAt: new Date().toISOString(),
      durationSeconds: elapsedSeconds(startedAtMs.current),
    }
    setMetrics(result)
    if (completed) {
      setPhase('review')
      onComplete(result)
    }
    return result
  }

  const controller: LessonController = {
    phase,
    metrics,
    isReplay: replayFrom !== null,
    finishDemo,
    beginIndependent,
    recordError,
    recordHint,
    replayDemo,
    complete: () => finish(true),
    abandon: () => finish(false),
  }

  return children(controller)
}
