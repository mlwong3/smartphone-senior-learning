import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LessonLayout } from './LessonLayout'

describe('LessonLayout', () => {
  it('returns the phone content to the top when the in-lesson view changes', () => {
    const { rerender, container } = render(
      <div className="phone-frame__content">
        <LessonLayout title="練習關卡" phase="guided" heading="跟着做" contentKey="sms" onBack={vi.fn()}>
          <p>短訊驗證</p>
        </LessonLayout>
      </div>,
    )
    const phoneContent = container.querySelector<HTMLElement>('.phone-frame__content')
    expect(phoneContent).not.toBeNull()
    if (!phoneContent) return

    phoneContent.scrollTop = 240
    rerender(
      <div className="phone-frame__content">
        <LessonLayout title="練習關卡" phase="guided" heading="跟着做" contentKey="email" onBack={vi.fn()}>
          <p>電郵驗證</p>
        </LessonLayout>
      </div>,
    )

    expect(phoneContent.scrollTop).toBe(0)
  })
})
