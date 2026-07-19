import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { AccessibilityToolbar } from './AccessibilityToolbar'

vi.mock('../services/speech', () => ({
  speakText: () => false,
}))

describe('AccessibilityToolbar', () => {
  it('shows a visible text fallback when speech is unavailable', async () => {
    const user = userEvent.setup()
    render(
      <AccessibilityToolbar
        settings={{ fontScale: 1, speechEnabled: true }}
        pageText="歡迎使用智學手機"
        onChange={() => undefined}
      />,
    )

    await user.click(screen.getByRole('button', { name: '讀出提示' }))

    const message = screen.getByRole('status')
    expect(message).toHaveTextContent('裝置未有可用語音，請閱讀畫面文字。')
    expect(message).not.toHaveClass('sr-only')
  })
})
