import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { LessonMetrics } from '../types'
import { LessonEngine } from './LessonEngine'

describe('LessonEngine', () => {
  it('leaves completedAt empty when a lesson is abandoned', async () => {
    const user = userEvent.setup()
    const onAbandon = vi.fn<(metrics: LessonMetrics) => void>()

    render(
      <LessonEngine onComplete={() => undefined}>
        {(lesson) => (
          <button type="button" onClick={() => onAbandon(lesson.abandon())}>
            離開練習
          </button>
        )}
      </LessonEngine>,
    )

    await user.click(screen.getByRole('button', { name: '離開練習' }))

    const abandonedMetrics = onAbandon.mock.calls[0][0]
    expect(abandonedMetrics.completed).toBe(false)
    expect(abandonedMetrics).not.toHaveProperty('completedAt')
  })

  it('counts only time spent in independent practice when replaying the demo', () => {
    const onComplete = vi.fn<(metrics: LessonMetrics) => void>()
    const now = vi.spyOn(Date, 'now')

    render(
      <LessonEngine onComplete={onComplete}>
        {(lesson) => (
          <>
            <button type="button" onClick={lesson.beginIndependent}>開始獨立練習</button>
            <button type="button" onClick={lesson.replayDemo}>重看示範</button>
            <button type="button" onClick={lesson.finishDemo}>返回獨立練習</button>
            <button type="button" onClick={lesson.complete}>完成練習</button>
          </>
        )}
      </LessonEngine>,
    )

    now.mockReturnValue(1_000)
    fireEvent.click(screen.getByRole('button', { name: '開始獨立練習' }))
    now.mockReturnValue(6_000)
    fireEvent.click(screen.getByRole('button', { name: '重看示範' }))
    now.mockReturnValue(36_000)
    fireEvent.click(screen.getByRole('button', { name: '返回獨立練習' }))
    now.mockReturnValue(40_000)
    fireEvent.click(screen.getByRole('button', { name: '完成練習' }))

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({ durationSeconds: 9 }),
    )
    now.mockRestore()
  })
})
