import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CaptchaLesson } from './CaptchaLesson'

describe('CaptchaLesson', () => {
  it('gives directional feedback and completes image and text practice', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<CaptchaLesson onBack={vi.fn()} onComplete={onComplete} />)

    expect(screen.getByRole('heading', { name: '示範一次' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '開始跟着做' }))

    await user.click(screen.getByRole('button', { name: '圖片 1：巴士，未選取' }))
    await user.click(screen.getByRole('button', { name: '圖片 2：樹木，未選取' }))
    await user.click(screen.getByRole('button', { name: '檢查圖片' }))
    expect(screen.getByRole('alert')).toHaveTextContent('再看看')

    await user.click(screen.getByRole('button', { name: '圖片 2：樹木，已選取' }))
    await user.click(screen.getByRole('button', { name: '圖片 5：巴士，未選取' }))
    await user.click(screen.getByRole('button', { name: '圖片 9：巴士，未選取' }))
    await user.click(screen.getByRole('button', { name: '檢查圖片' }))
    await user.click(screen.getByRole('button', { name: '開始自己完成' }))

    await user.click(screen.getByRole('button', { name: '圖片 2：交通燈，未選取' }))
    await user.click(screen.getByRole('button', { name: '圖片 4：交通燈，未選取' }))
    await user.click(screen.getByRole('button', { name: '圖片 8：交通燈，未選取' }))
    await user.click(screen.getByRole('button', { name: '檢查圖片' }))
    await user.type(screen.getByLabelText('輸入看到的五位英數碼'), 'hk628')
    await user.click(screen.getByRole('button', { name: '完成安全驗證' }))

    expect(screen.getByRole('heading', { name: '安全驗證練習完成' })).toBeInTheDocument()
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ completed: true, errorCount: 1 }))
  })
})
