import { render, screen } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { OrderingLesson } from './OrderingLesson'

async function completeGuidedOrder(user: UserEvent) {
  await user.click(screen.getByRole('button', { name: '開始跟着做' }))
  await user.click(screen.getByRole('button', { name: '查看飯類' }))
  await user.click(screen.getByRole('button', { name: '選擇叉燒滑蛋飯，價格 48 元' }))
  await user.click(screen.getByRole('button', { name: '加入購物車' }))
  await user.click(screen.getByRole('button', { name: '開始自己完成' }))
}

describe('OrderingLesson', () => {
  it('supports a realistic category, product, cart and confirmation journey', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<OrderingLesson onBack={vi.fn()} onComplete={onComplete} />)

    await completeGuidedOrder(user)

    expect(screen.getByRole('heading', { name: '請選擇餐品分類' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', {
      name: /^查看(?:招牌套餐|飯類|粉麵|三文治／多士|小食|冷熱飲品)$/,
    })).toHaveLength(6)

    await user.click(screen.getByRole('button', { name: '查看飯類' }))
    await user.click(screen.getByRole('button', { name: '選擇咖喱雞飯，價格 52 元' }))
    await user.click(screen.getByRole('button', { name: '增加選購數量' }))
    await user.click(screen.getByRole('button', { name: '加入購物車' }))

    await user.click(screen.getByRole('button', { name: '返回分類' }))
    await user.click(screen.getByRole('button', { name: '查看冷熱飲品' }))
    await user.click(screen.getByRole('button', { name: '選擇港式奶茶，價格 14 元' }))
    await user.click(screen.getByRole('button', { name: '加入購物車' }))

    await user.click(screen.getByRole('button', { name: '查看購物車，3件，總額118元' }))
    expect(screen.getByText('總額：$118')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '增加港式奶茶數量' }))
    expect(screen.getByText('總額：$132')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '減少港式奶茶數量' }))
    expect(screen.getByText('總額：$118')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '返回餐牌' }))
    expect(screen.getByRole('heading', { name: '冷熱飲品' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '查看購物車，3件，總額118元' }))
    await user.click(screen.getByRole('button', { name: '前往確認訂單' }))

    expect(screen.getByRole('heading', { name: '最後核對練習訂單' })).toBeInTheDocument()
    expect(screen.getByText('總額：$118')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '確認練習訂單｜不會付款' }))

    expect(screen.getByRole('heading', { name: '外賣點餐練習完成' })).toBeInTheDocument()
    expect(onComplete).toHaveBeenCalledWith(expect.objectContaining({ completed: true, errorCount: 0 }))
  }, 10_000)

  it('blocks an empty cart at the confirmation boundary', async () => {
    const user = userEvent.setup()
    const onComplete = vi.fn()
    render(<OrderingLesson onBack={vi.fn()} onComplete={onComplete} />)

    await completeGuidedOrder(user)
    await user.click(screen.getByRole('button', { name: '查看購物車，0件，總額0元' }))
    await user.click(screen.getByRole('button', { name: '前往確認訂單' }))

    expect(screen.getByRole('alert')).toHaveTextContent('購物車仍是空的')
    expect(onComplete).not.toHaveBeenCalled()
  })

  it('removes an item when its cart quantity reaches zero', async () => {
    const user = userEvent.setup()
    render(<OrderingLesson onBack={vi.fn()} onComplete={vi.fn()} />)

    await completeGuidedOrder(user)
    await user.click(screen.getByRole('button', { name: '查看三文治／多士' }))
    await user.click(screen.getByRole('button', { name: '選擇火腿蛋三文治，價格 28 元' }))
    await user.click(screen.getByRole('button', { name: '加入購物車' }))
    await user.click(screen.getByRole('button', { name: '查看購物車，1件，總額28元' }))
    await user.click(screen.getByRole('button', { name: '移除火腿蛋三文治' }))

    expect(screen.getByText('購物車暫時是空的')).toBeInTheDocument()
    expect(screen.getByText('總額：$0')).toBeInTheDocument()
  })
})
