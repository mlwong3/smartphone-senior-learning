import type { LevelDefinition } from '../types'

export const levels: LevelDefinition[] = [
  {
    id: 'registration',
    order: 1,
    title: '註冊帳號',
    description: '練習姓名、電話和安全密碼',
    available: true,
  },
  {
    id: 'captcha',
    order: 2,
    title: '安全驗證',
    description: '練習圖像和文字安全驗證',
    available: true,
  },
  {
    id: 'ordering',
    order: 3,
    title: '外賣點餐',
    description: '練習選餐、數量和確認訂單',
    available: true,
  },
]
