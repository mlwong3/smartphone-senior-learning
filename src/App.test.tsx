import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { STORAGE_KEYS } from './services/storage'

describe('Smartphone Learning home', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/')
  })

  it('shows the competition brand, safety message, and three levels', () => {
    render(<App />)

    expect(screen.getByRole('heading', { name: '智學手機' })).toBeInTheDocument()
    expect(screen.getByText('長者數碼生活安全練習平台')).toBeInTheDocument()
    expect(screen.getByText(/不用真資料、不會建立帳號、不會付款/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /註冊帳號/ })).toBeEnabled()
    expect(screen.getByRole('button', { name: /安全驗證/ })).toBeDisabled()
    expect(screen.getByRole('button', { name: /外賣點餐/ })).toBeDisabled()
  })

  it('changes and persists the large text setting', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: '放大文字' }))

    expect(document.documentElement.style.getPropertyValue('--user-font-scale')).toBe('1.15')
    expect(localStorage.getItem(STORAGE_KEYS.settings)).toContain('1.15')
  })

  it('stores an anonymous completed session only in study mode', async () => {
    const user = userEvent.setup()
    window.history.replaceState({}, '', '/?study=1')
    render(<App />)

    await user.click(screen.getByRole('button', { name: '導師測試工具' }))
    await user.type(screen.getByLabelText('匿名參加者代碼'), 'P01')
    await user.click(screen.getByRole('radio', { name: '3 分' }))
    await user.click(screen.getByRole('button', { name: '開始匿名測試' }))

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
    await user.click(screen.getByRole('button', { name: '完成回顧並返回首頁' }))

    expect(screen.getByRole('heading', { name: '完成後小問題' })).toBeInTheDocument()
    await user.click(screen.getByRole('radio', { name: '4 分' }))
    await user.click(screen.getByRole('button', { name: '保存後測結果' }))

    const stored = localStorage.getItem(STORAGE_KEYS.sessions)
    expect(stored).toContain('P01')
    expect(stored).toContain('"confidenceAfter":4')
  })
})
