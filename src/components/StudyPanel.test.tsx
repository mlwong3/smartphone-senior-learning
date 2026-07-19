import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { PostConfidencePanel, StudyPanel } from './StudyPanel'

describe('StudyPanel', () => {
  it('starts an anonymous study session with a valid code and confidence score', async () => {
    const user = userEvent.setup()
    const onStart = vi.fn()
    render(
      <StudyPanel
        sessions={[]}
        progress={{
          registration: { unlocked: true, completed: false },
          captcha: { unlocked: false, completed: false },
          ordering: { unlocked: false, completed: false },
        }}
        onStart={onStart}
        onBack={vi.fn()}
        onExport={vi.fn()}
        onClear={vi.fn()}
      />,
    )

    await user.type(screen.getByLabelText('匿名參加者代碼'), 'P01')
    await user.click(screen.getByRole('radio', { name: '3 分' }))
    await user.click(screen.getByRole('button', { name: '開始匿名測試' }))

    expect(onStart).toHaveBeenCalledWith({
      participantCode: 'P01',
      levelId: 'registration',
      confidenceBefore: 3,
    })
  })

  it('rejects participant codes outside P01 to P05', async () => {
    const user = userEvent.setup()
    render(
      <StudyPanel
        sessions={[]}
        progress={{
          registration: { unlocked: true, completed: false },
          captcha: { unlocked: false, completed: false },
          ordering: { unlocked: false, completed: false },
        }}
        onStart={vi.fn()}
        onBack={vi.fn()}
        onExport={vi.fn()}
        onClear={vi.fn()}
      />,
    )
    await user.type(screen.getByLabelText('匿名參加者代碼'), 'P06')
    await user.click(screen.getByRole('radio', { name: '3 分' }))
    await user.click(screen.getByRole('button', { name: '開始匿名測試' }))
    expect(screen.getByRole('alert')).toHaveTextContent('請輸入 P01 至 P05')
  })

  it('does not invent a chart when there are fewer than two paired records', () => {
    render(
      <StudyPanel
        sessions={[]}
        progress={{
          registration: { unlocked: true, completed: false },
          captcha: { unlocked: false, completed: false },
          ordering: { unlocked: false, completed: false },
        }}
        onStart={vi.fn()}
        onBack={vi.fn()}
        onExport={vi.fn()}
        onClear={vi.fn()}
      />,
    )
    expect(screen.getByText('數據不足')).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: /完成時間比較/ })).not.toBeInTheDocument()
  })

  it('collects the confidence score after a completed practice', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<PostConfidencePanel participantCode="P01" onSubmit={onSubmit} />)
    await user.click(screen.getByRole('radio', { name: '4 分' }))
    await user.click(screen.getByRole('button', { name: '保存後測結果' }))
    expect(onSubmit).toHaveBeenCalledWith(4)
  })
})
