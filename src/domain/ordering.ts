export type MenuItemId = 'sandwich' | 'chicken-rice' | 'vegetable-noodles'

export interface MenuItem {
  id: MenuItemId
  name: string
  price: number
}

export type Cart = Partial<Record<MenuItemId, number>>

export const MENU_ITEMS: MenuItem[] = [
  { id: 'sandwich', name: '火腿蛋三文治', price: 28 },
  { id: 'chicken-rice', name: '雞髀飯', price: 42 },
  { id: 'vegetable-noodles', name: '雜菜米粉', price: 38 },
]

export function setCartQuantity(cart: Cart, itemId: MenuItemId, quantity: number): Cart {
  const next = { ...cart }
  if (quantity <= 0) delete next[itemId]
  else next[itemId] = Math.floor(quantity)
  return next
}

export function calculateCartTotal(cart: Cart, menuItems: MenuItem[]): number {
  return menuItems.reduce((total, item) => total + item.price * (cart[item.id] ?? 0), 0)
}
