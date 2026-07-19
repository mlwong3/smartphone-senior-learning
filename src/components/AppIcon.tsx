import type { LevelDefinition, LevelProgress } from '../types'
import { Icon } from './Icons'
import './AppIcon.css'

interface AppIconProps {
  level: LevelDefinition
  progress: LevelProgress
  onOpen: (id: LevelDefinition['id']) => void
}

export function AppIcon({ level, progress, onOpen }: AppIconProps) {
  const { unlocked, completed } = progress
  const statusLabel = completed ? '已完成' : unlocked ? '可以開始' : '未開放'

  return (
    <button
      type="button"
      className="level-card"
      onClick={() => onOpen(level.id)}
      disabled={!unlocked}
      aria-label={`${level.title}，${statusLabel}。${level.description}`}
    >
      <span className={`level-card__icon level-card__icon--${level.id}`}>
        <Icon name={level.id} size={48} />
      </span>
      <span className="level-card__copy">
        <span className="level-card__number">關卡 {level.order}</span>
        <span className="level-card__name">{level.title}</span>
        <span className="level-card__description">{level.description}</span>
      </span>
      <span className={`level-card__status level-card__status--${completed ? 'done' : unlocked ? 'ready' : 'locked'}`}>
        <Icon name={completed ? 'check' : unlocked ? level.id : 'lock'} size={24} />
        {statusLabel}
      </span>
    </button>
  )
}
