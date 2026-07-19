export type MenuCategoryId =
  | 'signature-set'
  | 'rice'
  | 'noodles'
  | 'toast'
  | 'snacks'
  | 'drinks'

export type MenuItemId =
  | 'satay-beef-noodles-set'
  | 'breakfast-set'
  | 'char-siu-egg-rice'
  | 'curry-chicken-rice'
  | 'fish-ball-ho-fun'
  | 'preserved-vegetable-pork-rice-noodles'
  | 'ham-egg-sandwich'
  | 'butter-toast'
  | 'pineapple-bun-butter'
  | 'fried-chicken-wings'
  | 'milk-tea'
  | 'lemon-tea'

export interface MenuCategory {
  id: MenuCategoryId
  name: string
  description: string
}

export interface MenuItem {
  id: MenuItemId
  categoryId: MenuCategoryId
  name: string
  description: string
  price: number
  imageLabel: string
}

export type Cart = Partial<Record<MenuItemId, number>>

export const MAX_CART_QUANTITY = 9

export const MENU_CATEGORIES: readonly MenuCategory[] = [
  { id: 'signature-set', name: '招牌套餐', description: '茶餐廳人氣套餐' },
  { id: 'rice', name: '飯類', description: '經典碟頭飯' },
  { id: 'noodles', name: '粉麵', description: '湯粉麵精選' },
  { id: 'toast', name: '三文治／多士', description: '輕食及下午茶' },
  { id: 'snacks', name: '小食', description: '港式滋味小食' },
  { id: 'drinks', name: '冷熱飲品', description: '經典茶記飲品' },
]

export const MENU_ITEMS: readonly MenuItem[] = [
  {
    id: 'satay-beef-noodles-set',
    categoryId: 'signature-set',
    name: '沙嗲牛肉麵套餐',
    description: '沙嗲牛肉公仔麵、牛油多士及炒蛋',
    price: 46,
    imageLabel: '沙嗲牛肉麵、牛油多士和炒蛋套餐插圖',
  },
  {
    id: 'breakfast-set',
    categoryId: 'signature-set',
    name: '早餐常餐',
    description: '火腿通粉、煎蛋及牛油多士',
    price: 42,
    imageLabel: '火腿通粉、煎蛋和牛油多士套餐插圖',
  },
  {
    id: 'char-siu-egg-rice',
    categoryId: 'rice',
    name: '叉燒滑蛋飯',
    description: '嫩滑炒蛋配叉燒及白飯',
    price: 48,
    imageLabel: '叉燒滑蛋飯插圖',
  },
  {
    id: 'curry-chicken-rice',
    categoryId: 'rice',
    name: '咖喱雞飯',
    description: '咖喱汁、雞件、薯仔及白飯',
    price: 52,
    imageLabel: '咖喱雞飯插圖',
  },
  {
    id: 'fish-ball-ho-fun',
    categoryId: 'noodles',
    name: '魚蛋河',
    description: '魚蛋、河粉及清湯',
    price: 38,
    imageLabel: '魚蛋河粉插圖',
  },
  {
    id: 'preserved-vegetable-pork-rice-noodles',
    categoryId: 'noodles',
    name: '雪菜肉絲米粉',
    description: '雪菜、肉絲、米粉及湯底',
    price: 40,
    imageLabel: '雪菜肉絲米粉插圖',
  },
  {
    id: 'ham-egg-sandwich',
    categoryId: 'toast',
    name: '火腿蛋三文治',
    description: '火腿、煎蛋及烘底方包',
    price: 28,
    imageLabel: '火腿蛋三文治插圖',
  },
  {
    id: 'butter-toast',
    categoryId: 'toast',
    name: '奶油多士',
    description: '煉奶及牛油脆多士',
    price: 20,
    imageLabel: '奶油多士插圖',
  },
  {
    id: 'pineapple-bun-butter',
    categoryId: 'snacks',
    name: '菠蘿油',
    description: '香脆菠蘿包配厚切牛油',
    price: 16,
    imageLabel: '菠蘿油插圖',
  },
  {
    id: 'fried-chicken-wings',
    categoryId: 'snacks',
    name: '炸雞翼',
    description: '香脆炸雞翼三隻',
    price: 32,
    imageLabel: '三隻炸雞翼插圖',
  },
  {
    id: 'milk-tea',
    categoryId: 'drinks',
    name: '港式奶茶',
    description: '可選熱飲或少冰凍飲',
    price: 14,
    imageLabel: '港式奶茶插圖',
  },
  {
    id: 'lemon-tea',
    categoryId: 'drinks',
    name: '檸檬茶',
    description: '可選熱飲或少冰凍飲',
    price: 14,
    imageLabel: '檸檬茶插圖',
  },
]

export function getMenuItemsByCategory(categoryId: MenuCategoryId): readonly MenuItem[] {
  return MENU_ITEMS.filter((item) => item.categoryId === categoryId)
}

export function setCartQuantity(cart: Cart, itemId: MenuItemId, quantity: number): Cart {
  const next = { ...cart }
  const normalizedQuantity = Math.min(MAX_CART_QUANTITY, Math.floor(quantity))
  if (normalizedQuantity <= 0) delete next[itemId]
  else next[itemId] = normalizedQuantity
  return next
}

export function getCartCount(cart: Cart): number {
  return Object.values(cart).reduce<number>((total, quantity) => total + (quantity ?? 0), 0)
}

export function calculateCartTotal(cart: Cart, menuItems: readonly MenuItem[]): number {
  return menuItems.reduce(
    (total, item) => total + item.price * (cart[item.id] ?? 0),
    0,
  )
}
