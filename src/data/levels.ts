import type { Level, ProgressMap } from '../types'

// 三個關卡的靜態定義
export const levels: Level[] = [
  {
    id: 'level1',
    order: 1,
    name: '註冊帳號',
    icon: '📝',
    iconColor: 'var(--color-primary)',
    description: '練習填寫姓名、電話和密碼',
  },
  {
    id: 'level2',
    order: 2,
    name: '安全驗證',
    icon: '🛡️',
    iconColor: 'var(--color-success)',
    description: '練習圖像和文字安全驗證',
  },
  {
    id: 'level3',
    order: 3,
    name: '外賣點餐',
    icon: '🍱',
    iconColor: '#E8710A',
    description: '練習用手機 App 點餐',
  },
]

// 進度初始值：第一關預設解鎖，其餘鎖住。
// 注意：此階段進度只存在 React state，重新整理會重置；
// 階段三會改接 localStorage 做持久化。
export const initialProgress: ProgressMap = {
  level1: { unlocked: true, completed: false },
  level2: { unlocked: false, completed: false },
  level3: { unlocked: false, completed: false },
}
