import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { RegistrationLesson } from './RegistrationLesson'

describe('RegistrationLesson', () => {
  it('moves from demonstration through guided practice to an independent review', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<RegistrationLesson onBack={vi.fn()} onComplete={onComplete} />)

    expect(screen.getByRole('heading', { name: '示範一次' })).toBeInTheDocument()
    expect(screen.getByText('陳美玲')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '開始跟着做' }))

    await user.type(screen.getByLabelText('練習姓名'), '李好學')
    await user.click(screen.getByRole('button', { name: '檢查並繼續' }))
    await user.type(screen.getByLabelText('練習電話'), '9876-5432')
    await user.click(screen.getByRole('button', { name: '檢查並繼續' }))
    await user.type(screen.getByLabelText('練習密碼'), 'Safe1234')
    await user.click(screen.getByRole('button', { name: '完成跟着做' }))

    await user.click(screen.getByRole('button', { name: '開始自己完成' }))
    await user.type(screen.getByLabelText('姓名'), '陳安心')
    await user.type(screen.getByLabelText('電話'), '6123 4567')
    await user.type(screen.getByLabelText('密碼'), 'abcdefg')
    await user.click(screen.getByRole('button', { name: '檢查資料' }))
    expect(screen.getByText(/還差 1 個/)).toBeInTheDocument()

    await user.clear(screen.getByLabelText('密碼'))
    await user.type(screen.getByLabelText('密碼'), 'Study123')
    await user.click(screen.getByRole('button', { name: '檢查資料' }))

    expect(screen.getByRole('heading', { name: '註冊帳號練習完成' })).toBeInTheDocument()
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ completed: true, errorCount: 1 }))
  })

  it('does not count showing a password as a hint', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<RegistrationLesson onBack={vi.fn()} onComplete={onComplete} />)

    await user.click(screen.getByRole('button', { name: '開始跟着做' }))
    await user.type(screen.getByLabelText('練習姓名'), '李好學')
    await user.click(screen.getByRole('button', { name: '檢查並繼續' }))
    await user.type(screen.getByLabelText('練習電話'), '98765432')
    await user.click(screen.getByRole('button', { name: '檢查並繼續' }))
    await user.click(screen.getByRole('button', { name: '顯示密碼' }))
    expect(screen.getByRole('button', { name: '隱藏密碼' })).toBeInTheDocument()
  })

  it('returns to the top when the learning phase changes', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <div className="phone-frame__content">
        <RegistrationLesson onBack={vi.fn()} onComplete={vi.fn()} />
      </div>,
    )
    const phoneContent = container.querySelector<HTMLElement>('.phone-frame__content')
    expect(phoneContent).not.toBeNull()
    if (!phoneContent) return
    phoneContent.scrollTop = 320

    await user.click(screen.getByRole('button', { name: '開始跟着做' }))

    expect(phoneContent.scrollTop).toBe(0)
    expect(screen.getByRole('heading', { name: '跟着做' })).toBeInTheDocument()
  })

  it('uses the completion action when the top back button is pressed on review', async () => {
    const user = userEvent.setup()
    const onBack = vi.fn()
    const onFinish = vi.fn()
    render(
      <RegistrationLesson
        onBack={onBack}
        onComplete={vi.fn()}
        onFinish={onFinish}
      />,
    )

    await user.click(screen.getByRole('button', { name: '開始跟着做' }))
    await user.type(screen.getByLabelText('練習姓名'), '李好學')
    await user.click(screen.getByRole('button', { name: '檢查並繼續' }))
    await user.type(screen.getByLabelText('練習電話'), '98765432')
    await user.click(screen.getByRole('button', { name: '檢查並繼續' }))
    await user.type(screen.getByLabelText('練習密碼'), 'Safe1234')
    await user.click(screen.getByRole('button', { name: '完成跟着做' }))
    await user.click(screen.getByRole('button', { name: '開始自己完成' }))
    await user.type(screen.getByLabelText('姓名'), '陳安心')
    await user.type(screen.getByLabelText('電話'), '61234567')
    await user.type(screen.getByLabelText('密碼'), 'Study123')
    await user.click(screen.getByRole('button', { name: '檢查資料' }))

    await user.click(screen.getByRole('button', { name: '返回首頁' }))

    expect(onFinish).toHaveBeenCalledOnce()
    expect(onBack).not.toHaveBeenCalled()
  })
})
