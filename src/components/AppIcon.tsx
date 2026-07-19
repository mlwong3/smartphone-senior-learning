import type { Level, LevelProgress } from '../types'
import './AppIcon.css'

interface AppIconProps {
  level: Level
  progress: LevelProgress
  onOpen: (id: Level['id']) => void
}

// 單一 App 圖示：emoji 圖示 + 名稱 + 狀態標記。
// 狀態用「顏色＋圖示＋文字」三重表達：
//   已完成 → 綠色 ✓ 完成；未解鎖 → 灰色 🔒 未開放；可進入 → 主色。
export function AppIcon({ level, progress, onOpen }: AppIconProps) {
  const { unlocked, completed } = progress

  const statusLabel = completed ? '已完成' : unlocked ? '可以開始' : '未開放'

  return (
    <button
      className="app-icon"
      onClick={() => unlocked && onOpen(level.id)}
      disabled={!unlocked}
      aria-label={`${level.name}，${statusLabel}。${level.description}`}
    >
      <span
        className="app-icon__tile"
        style={{ background: unlocked ? level.iconColor : 'var(--color-locked)' }}
      >
        <span className="app-icon__emoji" aria-hidden="true">
          {level.icon}
        </span>
        {!unlocked && (
          <span className="app-icon__lock" aria-hidden="true">
            🔒
          </span>
        )}
      </span>

      <span className="app-icon__name">{level.name}</span>

      <span
        className={
          'app-icon__status' +
          (completed
            ? ' app-icon__status--done'
            : unlocked
              ? ' app-icon__status--ready'
              : ' app-icon__status--locked')
        }
      >
        {completed ? '✓ 已完成' : unlocked ? '可以開始' : '🔒 未開放'}
      </span>
    </button>
  )
}
