import { describe, expect, it } from 'vitest'
import {
  MENU_CATEGORIES,
  MENU_ITEMS,
  calculateCartTotal,
  getCartCount,
  getMenuItemsByCategory,
  setCartQuantity,
} from './ordering'

describe('安心茶餐廳餐牌', () => {
  it('provides six categories and twelve locally described menu items', () => {
    expect(MENU_CATEGORIES.map((category) => category.id)).toEqual([
      'signature-set',
      'rice',
      'noodles',
      'toast',
      'snacks',
      'drinks',
    ])
    expect(MENU_ITEMS).toHaveLength(12)
    expect(getMenuItemsByCategory('rice')).toEqual([
      expect.objectContaining({ id: 'char-siu-egg-rice', name: '叉燒滑蛋飯', price: 48 }),
      expect.objectContaining({ id: 'curry-chicken-rice', name: '咖喱雞飯', price: 52 }),
    ])
    expect(MENU_ITEMS.every((item) => item.description && item.imageLabel)).toBe(true)
  })

  it('adds, caps, updates and removes menu quantities', () => {
    let cart = setCartQuantity({}, 'char-siu-egg-rice', 12)
    expect(cart).toEqual({ 'char-siu-egg-rice': 9 })
    cart = setCartQuantity(cart, 'char-siu-egg-rice', 2.8)
    expect(cart).toEqual({ 'char-siu-egg-rice': 2 })
    cart = setCartQuantity(cart, 'char-siu-egg-rice', 0)
    expect(cart).toEqual({})
  })

  it('calculates cart count and total from menu prices and quantities', () => {
    const cart = { 'char-siu-egg-rice': 1, 'milk-tea': 2 } as const
    expect(getCartCount(cart)).toBe(3)
    expect(calculateCartTotal(cart, MENU_ITEMS)).toBe(76)
  })
})
