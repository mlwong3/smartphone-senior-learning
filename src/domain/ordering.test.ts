import { describe, expect, it } from 'vitest'
import { MENU_ITEMS, calculateCartTotal, setCartQuantity } from './ordering'

describe('ordering cart calculations', () => {
  it('adds, updates and removes menu quantities without negative values', () => {
    let cart = setCartQuantity({}, 'chicken-rice', 2)
    expect(cart).toEqual({ 'chicken-rice': 2 })
    cart = setCartQuantity(cart, 'chicken-rice', 0)
    expect(cart).toEqual({})
  })

  it('calculates the total from menu prices and quantities', () => {
    expect(calculateCartTotal({ sandwich: 1, 'chicken-rice': 2 }, MENU_ITEMS)).toBe(112)
  })
})
