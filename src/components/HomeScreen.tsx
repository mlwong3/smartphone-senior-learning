import type { Level, ProgressMap, ScreenId } from '../types'
import { AppIcon } from './AppIcon'
import './HomeScreen.css'

interface HomeScreenProps {
  levels: Level[]
  progress: ProgressMap
  onOpenLevel: (id: Exclude<ScreenId, 'home'>) => void
}

// 首頁主畫面：標題 + 進度 + 三個大型 App 圖示。
export function HomeScreen({ levels, progress, onOpenLevel }: HomeScreenProps) {
  const completedCount = levels.filter((l) => progress[l.id].completed).length

  return (
    <div className="home-screen">
      <header className="home-screen__header">
        <h1 className="home-screen__title">帳號註冊練習</h1>
        <p className="home-screen__subtitle">點一下圖示，開始學習</p>
        <p className="home-screen__progress">
          已完成 {completedCount} / {levels.length} 關
        </p>
      </header>

      <div className="home-screen__grid">
        {levels.map((level) => (
          <AppIcon
            key={level.id}
            level={level}
            progress={progress[level.id]}
            onOpen={onOpenLevel}
          />
        ))}
      </div>
    </div>
  )
}
