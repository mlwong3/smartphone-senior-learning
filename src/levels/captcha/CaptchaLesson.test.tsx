import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CaptchaLesson } from './CaptchaLesson'

async function completeSmsAndEmail(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('六位數短訊驗證碼'), '381642')
  await user.click(screen.getByRole('button', { name: '確認驗證碼' }))
  await user.click(screen.getByRole('button', { name: /智學手機：確認練習帳號/ }))
  await user.click(screen.getByRole('button', { name: '確認練習帳號' }))
}

async function completeCaptcha(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('輸入看到的五位英數碼'), 'h7k3m')
  await user.click(screen.getByRole('button', { name: '確認文字驗證' }))
  await user.click(screen.getByRole('button', { name: '圖片 1：巴士，未選取' }))
  await user.click(screen.getByRole('button', { name: '圖片 2：巴士，未選取' }))
  await user.click(screen.getByRole('button', { name: '確認圖片驗證' }))
}

describe('CaptchaLesson', () => {
  it('completes the three-method journey before and during independent practice', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<CaptchaLesson onBack={vi.fn()} onComplete={onComplete} />)

    expect(screen.getByRole('heading', { name: '示範一次' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '開始跟着做' }))

    await completeSmsAndEmail(user)
    await completeCaptcha(user)
    expect(screen.getByRole('heading', { name: '準備自己完成' })).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '開始自己完成' }))
    await completeSmsAndEmail(user)
    await completeCaptcha(user)

    expect(screen.getByRole('heading', { name: '安全驗證練習完成' })).toBeInTheDocument()
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ completed: true, errorCount: 0, hintCount: 0 }))
  })

  it('reports an incomplete SMS code as an error', async () => {
    const user = userEvent.setup()
    render(<CaptchaLesson onBack={vi.fn()} onComplete={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: '開始跟着做' }))
    await user.type(screen.getByLabelText('六位數短訊驗證碼'), '381')
    await user.click(screen.getByRole('button', { name: '確認驗證碼' }))

    expect(screen.getByRole('alert')).toHaveTextContent('尚未輸入六位數')
  })

  it('gives feedback for a wrong email choice without counting it as an error', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<CaptchaLesson onBack={vi.fn()} onComplete={onComplete} />)

    await user.click(screen.getByRole('button', { name: '開始跟着做' }))
    await user.type(screen.getByLabelText('六位數短訊驗證碼'), '381642')
    await user.click(screen.getByRole('button', { name: '確認驗證碼' }))
    await user.click(screen.getByRole('button', { name: /安全通知：你的安全提示/ }))

    expect(screen.getByRole('alert')).toHaveTextContent('不是要找的確認電郵')

    await user.click(screen.getByRole('button', { name: /智學手機：確認練習帳號/ }))
    await user.click(screen.getByRole('button', { name: '確認練習帳號' }))
    await completeCaptcha(user)
    await user.click(screen.getByRole('button', { name: '開始自己完成' }))
    await completeSmsAndEmail(user)
    await completeCaptcha(user)

    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ completed: true, errorCount: 0 }))
  })

  it('changes the text CAPTCHA when the learner refreshes it', async () => {
    const user = userEvent.setup()
    render(<CaptchaLesson onBack={vi.fn()} onComplete={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: '開始跟着做' }))
    await completeSmsAndEmail(user)
    expect(screen.getByLabelText('驗證碼 H 7 K 3 M')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '重新整理驗證碼' }))

    expect(screen.getByLabelText('驗證碼 R 4 N 8 P')).toBeInTheDocument()
  })

  it('gives distinct feedback for missing and extra image choices', async () => {
    const user = userEvent.setup()
    render(<CaptchaLesson onBack={vi.fn()} onComplete={vi.fn()} />)

    await user.click(screen.getByRole('button', { name: '開始跟着做' }))
    await completeSmsAndEmail(user)
    await user.type(screen.getByLabelText('輸入看到的五位英數碼'), 'h7k3m')
    await user.click(screen.getByRole('button', { name: '確認文字驗證' }))

    await user.click(screen.getByRole('button', { name: '圖片 1：巴士，未選取' }))
    await user.click(screen.getByRole('button', { name: '確認圖片驗證' }))
    expect(screen.getByRole('alert')).toHaveTextContent('還有指定圖片未選取')

    await user.click(screen.getByRole('button', { name: '圖片 2：巴士，未選取' }))
    await user.click(screen.getByRole('button', { name: '圖片 3：樹木，未選取' }))
    await user.click(screen.getByRole('button', { name: '確認圖片驗證' }))
    expect(screen.getByRole('alert')).toHaveTextContent('有一張不是指定物件')
  })
})
