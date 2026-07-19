import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { OrderingLesson } from './OrderingLesson'

describe('OrderingLesson', () => {
  it('supports guided selection, cart changes, total checking and confirmation', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<OrderingLesson onBack={vi.fn()} onComplete={onComplete} />)

    await user.click(screen.getByRole('button', { name: '開始跟着做' }))
    await user.click(screen.getByRole('button', { name: /選擇火腿蛋三文治/ }))
    await user.click(screen.getByRole('button', { name: '加入購物車' }))
    await user.click(screen.getByRole('button', { name: '開始自己完成' }))

    await user.click(screen.getByRole('button', { name: '確認練習訂單' }))
    expect(screen.getByRole('alert')).toHaveTextContent('購物車仍是空的')

    await user.click(screen.getByRole('button', { name: /選擇雞髀飯/ }))
    await user.click(screen.getByRole('button', { name: '增加選購數量' }))
    await user.click(screen.getByRole('button', { name: '加入購物車' }))
    expect(screen.getByText('總額：$84')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '增加雞髀飯數量' }))
    expect(screen.getByText('總額：$126')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '減少雞髀飯數量' }))
    await user.click(screen.getByRole('button', { name: '確認練習訂單' }))

    expect(screen.getByRole('heading', { name: '外賣點餐練習完成' })).toBeInTheDocument()
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ completed: true, errorCount: 1 }))
  })
})
