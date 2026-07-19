// 畫面識別碼：首頁或三個關卡
export type ScreenId = 'home' | 'level1' | 'level2' | 'level3'

// 單一關卡的資料結構
export interface Level {
  id: Exclude<ScreenId, 'home'>
  /** 關卡序號（1、2、3），用於顯示與解鎖順序 */
  order: number
  /** 關卡名稱，例如「註冊帳號」 */
  name: string
  /** App 圖示（emoji） */
  icon: string
  /** 圖示底色（CSS 顏色值或變數） */
  iconColor: string
  /** 一句簡短說明 */
  description: string
}

// 關卡進度狀態：是否解鎖、是否完成
export interface LevelProgress {
  unlocked: boolean
  completed: boolean
}

// 以關卡 id 為 key 的進度表
export type ProgressMap = Record<Level['id'], LevelProgress>
