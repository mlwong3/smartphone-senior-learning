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
})
