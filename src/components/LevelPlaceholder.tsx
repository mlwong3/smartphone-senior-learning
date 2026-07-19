import type { Level } from '../types'
import './LevelPlaceholder.css'

interface LevelPlaceholderProps {
  level: Level
  onBack: () => void
  onComplete: (id: Level['id']) => void
}

// 關卡佔位畫面：階段二會用真正的教學流程元件替換這裡。
// 目前提供「返回首頁」與「（暫時）標記完成」以便測試切換與解鎖流程。
export function LevelPlaceholder({ level, onBack, onComplete }: LevelPlaceholderProps) {
  return (
    <div className="level-placeholder">
      <header className="level-placeholder__header">
        <button className="level-placeholder__back" onClick={onBack}>
          ← 返回首頁
        </button>
        <h1 className="level-placeholder__title">
          <span aria-hidden="true">{level.icon}</span> {level.name}
        </h1>
      </header>

      <div className="level-placeholder__body">
        <p className="level-placeholder__desc">{level.description}</p>
        <p className="level-placeholder__note">這個關卡的教學內容稍後完成。</p>
        {/* 暫時用來測試解鎖流程，階段三會由真正的完成邏輯取代 */}
        <button
          className="level-placeholder__complete"
          onClick={() => onComplete(level.id)}
        >
          （測試）完成這一關
        </button>
      </div>
    </div>
  )
}
